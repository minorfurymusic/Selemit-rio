/* VitalPat Cemitério · Gestão — dados de exemplo FICTÍCIOS (cemitério inventado, sem dados reais). */
'use strict';
(function () {
  const VP = window.VP;
  const u = VP.u;

  VP.criarDadosExemplo = async () => {
    const rnd = u.prng(20261008);
    const entre = (a, b) => Math.floor(a + rnd() * (b - a + 1));
    const cem = { id: 'C1', nome: 'Cemitério Municipal Exemplo', endereco: 'Rua Exemplo, 500', bairro: 'Centro', cidade: 'Cidade Exemplo', geo: null };
    const quadras = [];
    const tumulos = [];
    const defs = [];
    for (let i = 1; i <= 10; i++) defs.push({ nome: `Quadra ${String(i).padStart(2, '0')}`, codigo: String(i).padStart(2, '0'), tipo: 'comum' });
    defs.splice(10, 0, { nome: 'Quadra 10 A', codigo: '10A', tipo: 'comum' });
    defs.push({ nome: 'Quadra 11 Infantil', codigo: '11', tipo: 'infantil' }, { nome: 'Quadra 12 Jazigos', codigo: '12', tipo: 'jazigos' }, { nome: 'Gaveteiro 13', codigo: '13', tipo: 'gaveteiro' });
    defs.forEach((d, k) => {
      const q = { id: 'Q' + (k + 1), cemiterioId: 'C1', nome: d.nome, codigo: d.codigo, tipo: d.tipo, ordem: k + 1, geo: null };
      quadras.push(q);
      const nAleias = d.tipo === 'gaveteiro' ? 4 : entre(4, 8);
      for (let a = 1; a <= nAleias; a++) {
        const aleia = d.tipo === 'gaveteiro' ? 'Bloco ' + 'ABCD'[a - 1] : String(a).padStart(2, '0');
        const nCovas = d.tipo === 'gaveteiro' ? 40 : entre(14, 30);
        for (let n = 1; n <= nCovas; n++) {
          const letra = d.tipo !== 'gaveteiro' && rnd() < 0.05 ? ' A' : '';
          const sorte = rnd();
          tumulos.push({
            id: u.id(), cemiterioId: 'C1', quadraId: q.id, aleia, numero: String(n).padStart(3, '0') + letra,
            tipo: d.tipo === 'gaveteiro' ? 'gaveta' : d.tipo === 'jazigos' ? 'jazigo' : (rnd() < 0.06 ? 'jazigo' : 'sepultura'),
            ocupacao: sorte < 0.80 ? 'ocupado' : sorte < 0.92 ? 'vago' : sorte < 0.97 ? 'reservado' : 'nao-informado',
            comprimento: d.tipo === 'gaveteiro' ? 2.2 : d.tipo === 'infantil' ? 1.6 : 2.8,
            largura: d.tipo === 'gaveteiro' ? 0.8 : d.tipo === 'infantil' ? 1.0 : 1.4,
            observacao: '', fotos: [], anexos: [], qrAfixado: false, geo: null, criadoEm: VP.Plataforma.agoraISO()
          });
        }
      }
    });
    await VP.db.gravarVarias({ cemiterios: [cem], quadras, tumulos, meta: [{ id: 'config', valores: Object.assign({}, VP.CONFIG_PADRAO) }, { id: 'semente', ficticio: true, criadoEm: VP.Plataforma.agoraISO() }] });
  };
})();
