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
    if (f.situacao) l = l.filter((t) => VP.situacaoAtual(t) === f.situacao);
    if (f.sugestao) l = l.filter((t) => VP.sugestaoTriagem(t).nivel === f.sugestao);
    if (f.risco) l = l.filter((t) => VP.temRisco(t));
    if (f.semVistoria) l = l.filter((t) => !VP.vistoriasDe(t.id).length);
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
  // ---------------------------------------------------------------- vistorias e triagem (DOSSIE.md B2)
  // O sistema só SUGERE. A situação do túmulo muda apenas quando uma pessoa confirma.
  let porTumulo = null; // tumuloId → vistorias (mais nova primeiro); refeito quando os dados mudam
  const invalidarAntes = VP.invalidar;
  VP.invalidar = () => { invalidarAntes(); porTumulo = null; };
  VP.vistoriasDe = (tumuloId) => {
    if (!porTumulo) {
      porTumulo = new Map();
      for (const v of VP.db.lista('vistorias')) { if (!porTumulo.has(v.tumuloId)) porTumulo.set(v.tumuloId, []); porTumulo.get(v.tumuloId).push(v); }
      for (const l of porTumulo.values()) l.sort((a, b) => b.data.localeCompare(a.data) || String(b.criadoEm).localeCompare(String(a.criadoEm)));
    }
    return porTumulo.get(tumuloId) || [];
  };
  VP.ITENS_NOTA = ['v1', 'v2', 'v3', 'v4'];
  VP.notaVistoria = (v) => VP.ITENS_NOTA.reduce((s, k) => s + (Number(v[k]) || 0), 0);
  VP.situacaoAtual = (t) => t.situacao || 'regular';
  VP.temRisco = (t) => { const v = VP.vistoriasDe(t.id)[0]; return !!v && (Number(v.v1) >= 3 || Number(v.v4) >= 3); };
  VP.sugestaoTriagem = (t) => {
    const v = VP.vistoriasDe(t.id)[0];
    if (!v) return { nivel: 'regular', motivo: 'Sem vistoria' };
    const cfg = VP.config();
    const nota = VP.notaVistoria(v);
    const visita = v.v5 === 'sim';
    const maior = Math.max(...VP.ITENS_NOTA.map((k) => Number(v[k]) || 0));
    if (nota >= cfg.notaIndicio && !visita) return { nivel: 'indicio', motivo: `Nota ${nota} de 16 e sem sinais de visita` };
    if (nota >= cfg.notaIndicio) return { nivel: 'atencao', motivo: `Nota ${nota} de 16, mas com sinais de visita` };
    if (nota >= cfg.notaAtencao) return { nivel: 'atencao', motivo: `Nota ${nota} de 16` };
    if (maior >= 3) return { nivel: 'atencao', motivo: 'Um dos itens com nota 3 ou 4' };
    return { nivel: 'regular', motivo: `Nota ${nota} de 16` };
  };
  // Há diferença entre o que o sistema sugere e a situação gravada? (só nos 3 primeiros níveis)
  VP.sugestaoDiferente = (t) => {
    const atual = VP.situacaoAtual(t);
    if (atual === 'apuracao' || atual === 'declarado') return false;
    return VP.sugestaoTriagem(t).nivel !== atual;
  };
  const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  // Regra de segurança para "Abandono em apuração" (DOSSIE.md B2-C). Devolve o que falta.
  VP.requisitosApuracao = (t) => {
    const cfg = VP.config();
    const vs = VP.vistoriasDe(t.id);
    const faltas = [];
    if (VP.situacaoAtual(t) !== 'indicio') faltas.push('A situação atual precisa ser "Indício de abandono".');
    const datas = [...new Set(vs.map((v) => v.data))].sort();
    if (datas.length < 2) faltas.push(`Precisa de pelo menos 2 vistorias em datas diferentes (tem ${datas.length}).`);
    else if (dias(datas[0], datas[datas.length - 1]) < cfg.intervaloVistoriasDias) faltas.push(`Entre a primeira e a última vistoria precisa haver pelo menos ${cfg.intervaloVistoriasDias} dias (hoje há ${dias(datas[0], datas[datas.length - 1])}).`);
    const docs = (t.indicadores || []).filter((k) => k !== 'D5');
    if (!docs.length) faltas.push('Precisa de pelo menos 1 indicador documental (D1 a D4). D5 sozinho é regularização, não abandono.');
    if (t.excecaoHistorica) faltas.push('Túmulo marcado como de valor histórico, artístico ou de personalidade: consulte antes o órgão de patrimônio cultural e retire a marcação.');
    return faltas;
  };

  // ---------------------------------------------------------------- ordens de serviço
  VP.ordemAberta = (o) => o.situacao === 'aberta' || o.situacao === 'andamento';
  VP.ordemAtrasada = (o) => VP.ordemAberta(o) && !!o.prazo && o.prazo < VP.Plataforma.hoje();
  VP.ordensDe = (tumuloId) => VP.db.lista('ordensServico').filter((o) => o.tumuloId === tumuloId).sort((a, b) => String(b.abertaEm).localeCompare(String(a.abertaEm)));
  VP.proximoNumeroOrdem = () => {
    const ano = VP.Plataforma.hoje().slice(0, 4);
    const n = VP.db.lista('ordensServico', true).filter((o) => String(o.numero).endsWith('/' + ano)).length + 1;
    return `${n}/${ano}`;
  };
  // Código lido no campo → túmulo (sem diferença de maiúsculas, espaços e zeros à esquerda)
  VP.acharPorCodigo = (codigo) => {
    const alvo = String(codigo || '').toUpperCase().replace(/\s+/g, '');
    if (!alvo) return null;
    const norm = (c) => c.replace(/(^|-)([A-Z]?)0*(\d)/g, '$1$2$3');
    const de = (t) => VP.codigoTumulo(t).toUpperCase().replace(/\s+/g, '');
    return VP.db.lista('tumulos').find((t) => de(t) === alvo || norm(de(t)) === norm(alvo)) || null;
  };
  VP.registrosParaConferir = () => VP.db.lista('registrosCampo').filter((r) => !r.conferido);

  VP.pendencias = () => {
    const r = VP.resumo();
    const p = [];
    const add = (nivel, titulo, qtd, link) => { if (qtd > 0) p.push({ nivel, titulo, qtd, link }); };
    const tum = VP.db.lista('tumulos');
    const ordens = VP.db.lista('ordensServico');
    const comOrdemAberta = new Set(ordens.filter(VP.ordemAberta).map((o) => o.tumuloId));
    add('critico', 'Túmulos com risco (estrutura ou tampa com nota 3 ou 4) sem ordem de serviço aberta', tum.filter((t) => VP.temRisco(t) && !comOrdemAberta.has(t.id)).length, '#tumulos?risco=1');
    add('atencao', 'Ordens de serviço atrasadas', ordens.filter(VP.ordemAtrasada).length, '#ordens?atrasadas=1');
    add('atencao', 'Registros do aplicativo de campo aguardando conferência', VP.registrosParaConferir().length, '#vistorias/recebidos');
    add('atencao', 'Túmulos em que a sugestão da triagem difere da situação gravada', tum.filter(VP.sugestaoDiferente).length, '#triagem');
    add('atencao', 'Túmulos sem informação de ocupação', r['nao-informado'], '#tumulos?ocupacao=nao-informado');
    add('info', 'Túmulos aguardando a localização exata (levantamento da empresa)', r.total - r.exata, '#levantamento');
    add('info', 'Túmulos sem foto', r.total - r.comFoto, '#tumulos?semFoto=1');
    add('info', 'Túmulos sem plaqueta QR afixada', r.total - r.comQr, '#tumulos?semQr=1');
    const conflitos = VP.db.lista('importacoes').reduce((t, i) => t + (i.situacao === 'aplicada' ? (i.conflitos || []).length : 0), 0);
    add('atencao', 'Linhas de importação com conflito para revisar', conflitos, '#importar');
    return p;
  };
})();
