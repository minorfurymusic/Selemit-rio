/* VitalPat Cemitério · Gestão — regras sem tela: identificação dos túmulos, filtros, resumo, pendências, localização. */
'use strict';
(function () {
  const VP = window.VP;
  const u = VP.u;

  // ---------------------------------------------------------------- identificação única do túmulo
  // Mesmo túmulo = mesmo cemitério + quadra + aléia + número (ignorando zeros à esquerda, espaços e maiúsculas)
  VP.normNumero = (n) => {
    const t = String(n ?? '').toUpperCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
    const m = t.match(/^0*(\d+)\s*(.*)$/);
    return m ? (m[1] + (m[2] ? ' ' + m[2].replace(/^-\s*/, '').trim() : '')).trim() : t;
  };
  VP.normAleia = (a) => {
    const t = String(a ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
    const m = t.match(/^0*(\d+)$/);
    return m ? m[1] : t;
  };
  VP.normQuadra = (q) => u.normalizar(q).replace(/^quadra\s*/, '').replace(/^0+(\d)/, '$1').replace(/\s+/g, ' ');
  VP.chaveTumulo = (cemiterioId, quadraNome, aleia, numero) => `${cemiterioId}|${VP.normQuadra(quadraNome)}|${VP.normAleia(aleia)}|${VP.normNumero(numero)}`;
  VP.chaveDe = (t) => VP.chaveTumulo(t.cemiterioId, VP.db.pega('quadras', t.quadraId)?.nome || '', t.aleia, t.numero);
  VP.rotuloTumulo = (t) => `${VP.db.pega('quadras', t.quadraId)?.nome || '?'} · Aléia ${t.aleia || '—'} · Nº ${t.numero}`;
  VP.codigoTumulo = (t) => {
    const q = VP.db.pega('quadras', t.quadraId);
    return `Q${(q?.codigo || '?').replace(/\s+/g, '')}-A${VP.normAleia(t.aleia) || '0'}-${VP.normNumero(t.numero).replace(/\s+/g, '')}`;
  };

  // Índice: chave → túmulo (refeito quando os dados mudam)
  let indice = null;
  VP.invalidar = () => { indice = null; };
  VP.acharTumulo = (chave) => {
    if (!indice) { indice = new Map(); for (const t of VP.db.lista('tumulos')) indice.set(VP.chaveDe(t), t); }
    return indice.get(chave) || null;
  };

  // ---------------------------------------------------------------- busca e filtros
  VP.textoBusca = (t) => {
    if (!t._busca) t._busca = u.normalizar([VP.codigoTumulo(t), VP.rotuloTumulo(t), t.numero, t.observacao, VP.LISTAS.tipos[t.tipo]].join(' | '));
    return t._busca;
  };
  VP.filtrarTumulos = (f = {}) => {
    let l = VP.db.lista('tumulos');
    if (f.cemiterioId) l = l.filter((t) => t.cemiterioId === f.cemiterioId);
    if (f.quadraId) l = l.filter((t) => t.quadraId === f.quadraId);
    if (f.aleia) l = l.filter((t) => VP.normAleia(t.aleia) === VP.normAleia(f.aleia));
    if (f.tipo) l = l.filter((t) => t.tipo === f.tipo);
    if (f.ocupacao) l = l.filter((t) => t.ocupacao === f.ocupacao);
    if (f.semCoordenada) l = l.filter((t) => !VP.temCoordenada(t));
    if (f.comCoordenada) l = l.filter((t) => VP.temCoordenada(t));
    if (f.semFoto) l = l.filter((t) => !(t.fotos || []).length);
    if (f.semQr) l = l.filter((t) => !t.qrAfixado);
    if (f.busca) {
      const termos = u.normalizar(f.busca).split(/\s+/).filter(Boolean);
      l = l.filter((t) => { const x = VP.textoBusca(t); return termos.every((p) => x.includes(p)); });
    }
    return VP.ordenarTumulos(l);
  };
  VP.ordenarTumulos = (l) => {
    const q = (t) => VP.db.pega('quadras', t.quadraId);
    return l.sort((a, b) => (q(a)?.ordem ?? 999) - (q(b)?.ordem ?? 999) || u.ordemNumero(VP.normAleia(a.aleia), VP.normAleia(b.aleia)) || u.ordemNumero(VP.normNumero(a.numero), VP.normNumero(b.numero)));
  };

  // ---------------------------------------------------------------- localização (pronto para o levantamento da empresa)
  VP.temCoordenada = (t) => t.geo && Number.isFinite(t.geo.lat) && Number.isFinite(t.geo.lon);
  VP.coordenadaExata = (t) => VP.temCoordenada(t) && t.geo.fonte === 'levantamento' && (t.geo.precisao == null || t.geo.precisao <= VP.config().precisaoMaximaLevantamento);
  VP.validarCoordenada = (lat, lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'Latitude ou longitude inválida';
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 'Coordenada fora do mundo';
    if (lat < -34 || lat > 6 || lon < -74 || lon > -34) return 'Coordenada fora do Brasil (verifique se latitude e longitude não estão trocadas)';
    return null;
  };
  VP.linkGoogleMaps = (lat, lon) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  VP.centroide = (poligono) => {
    const p = poligono.filter((x) => Array.isArray(x) && x.length >= 2);
    if (!p.length) return null;
    return { lat: p.reduce((t, x) => t + x[0], 0) / p.length, lon: p.reduce((t, x) => t + x[1], 0) / p.length };
  };

  // ---------------------------------------------------------------- resumo e pendências
  VP.resumo = (lista = VP.db.lista('tumulos')) => {
    const r = { total: lista.length, ocupado: 0, vago: 0, reservado: 0, 'nao-informado': 0, comCoordenada: 0, exata: 0, comFoto: 0, comQr: 0 };
    for (const t of lista) {
      r[t.ocupacao] = (r[t.ocupacao] || 0) + 1;
      if (VP.temCoordenada(t)) r.comCoordenada++;
      if (VP.coordenadaExata(t)) r.exata++;
      if ((t.fotos || []).length) r.comFoto++;
      if (t.qrAfixado) r.comQr++;
    }
    return r;
  };
  VP.pendencias = () => {
    const r = VP.resumo();
    const p = [];
    const add = (nivel, titulo, qtd, link) => { if (qtd > 0) p.push({ nivel, titulo, qtd, link }); };
    add('atencao', 'Túmulos sem informação de ocupação', r['nao-informado'], '#tumulos?ocupacao=nao-informado');
    add('info', 'Túmulos aguardando a localização exata (levantamento da empresa)', r.total - r.exata, '#levantamento');
    add('info', 'Túmulos sem foto', r.total - r.comFoto, '#tumulos?semFoto=1');
    add('info', 'Túmulos sem plaqueta QR afixada', r.total - r.comQr, '#tumulos?semQr=1');
    const conflitos = VP.db.lista('importacoes').reduce((t, i) => t + (i.situacao === 'aplicada' ? (i.conflitos || []).length : 0), 0);
    add('atencao', 'Linhas de importação com conflito para revisar', conflitos, '#importar');
    return p;
  };
})();
