/* VitalPat Patrimônio · Gestão — base: utilidades, armazenamento e configuração.
   Sistema do Produto 1. Não usa nenhum arquivo do sistema do cemitério. */
'use strict';

const VP = window.VP = window.VP || {};

// ---------------------------------------------------------------------------
// Funções que dependem do ambiente ficam aqui para poderem ser trocadas em teste
// (ex.: VP.Plataforma.hoje = () => '2026-10-07').
// ---------------------------------------------------------------------------
VP.Plataforma = VP.Plataforma || {
  hoje: () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  agoraISO: () => new Date().toISOString()
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
VP.u = {
  esc: (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  id: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  num: (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const t = String(v ?? '').trim();
    if (!t) return null;
    // aceita "1.234,56" e "1234.56"
    const n = parseFloat(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
    return Number.isFinite(n) ? n : null;
  },
  moeda: (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  moedaCurta: (v) => {
    const a = Math.abs(v || 0);
    if (a >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
    if (a >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
    return VP.u.moeda(v);
  },
  inteiro: (v) => (v ?? 0).toLocaleString('pt-BR'),
  pct: (v) => ((v ?? 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
  data: (iso) => {
    if (!iso) return '—';
    const [a, m, d] = String(iso).slice(0, 10).split('-');
    return d && m && a ? `${d}/${m}/${a}` : '—';
  },
  mesNome: (ym) => {
    const nomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const [a, m] = ym.split('-');
    return `${nomes[+m - 1]}/${a.slice(2)}`;
  },
  mesExtenso: (ym) => {
    const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const [a, m] = ym.split('-');
    return `${nomes[+m - 1]} de ${a}`;
  },
  // Soma meses a uma data AAAA-MM-DD (devolve AAAA-MM)
  somaMeses: (ym, n) => {
    const [a, m] = ym.slice(0, 7).split('-').map(Number);
    const t = a * 12 + (m - 1) + n;
    return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
  },
  mesesEntre: (ymA, ymB) => {
    const [a1, m1] = ymA.slice(0, 7).split('-').map(Number);
    const [a2, m2] = ymB.slice(0, 7).split('-').map(Number);
    return (a2 * 12 + m2) - (a1 * 12 + m1);
  },
  fimDoMes: (ym) => {
    const [a, m] = ym.split('-').map(Number);
    return `${ym}-${String(new Date(a, m, 0).getDate()).padStart(2, '0')}`;
  },
  somaDias: (iso, n) => {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  },
  diasEntre: (isoA, isoB) => Math.round((new Date(isoB + 'T12:00:00') - new Date(isoA + 'T12:00:00')) / 86400000),
  normalizar: (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(),
  // "1,2,6-10,15" -> função que testa um número
  faixas: (texto) => {
    const partes = String(texto || '').split(/[;,\s]+/).filter(Boolean);
    const testes = [];
    for (const p of partes) {
      const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) testes.push((n) => n >= +m[1] && n <= +m[2]);
      else if (/^\d+$/.test(p)) testes.push((n) => n === +p);
      else return null;
    }
    return testes.length ? (n) => testes.some((t) => t(Number(n))) : null;
  },
  // Gerador de números previsível (para os dados de exemplo saírem sempre iguais)
  prng: (semente) => {
    let s = semente >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  },
  agruparSoma: (lista, chave, valor) => {
    const m = new Map();
    for (const x of lista) {
      const k = typeof chave === 'function' ? chave(x) : x[chave];
      m.set(k, (m.get(k) || 0) + (typeof valor === 'function' ? valor(x) : (valor ? x[valor] : 1)));
    }
    return m;
  }
};

// ---------------------------------------------------------------------------
// Listas fixas (texto simples para as telas)
// ---------------------------------------------------------------------------
VP.LISTAS = {
  tiposBem: { movel: 'Bem móvel', imovel: 'Bem imóvel', veiculo: 'Veículo', intangivel: 'Intangível (software, licença)', infraestrutura: 'Infraestrutura (ruas, redes, pontes)' },
  status: { ativo: 'Em uso', desuso: 'Em desuso', cedido: 'Fora (cedido/emprestado)', manutencao: 'Em conserto', baixado: 'Baixado' },
  estados: { 6: 'Novo', 5: 'Ótimo', 4: 'Bom', 3: 'Regular', 2: 'Ruim', 1: 'Péssimo' },
  situacoesAquisicao: ['Compra', 'Doação recebida', 'Cessão recebida', 'Permuta', 'Construção / obra', 'Desapropriação', 'Dação em pagamento', 'Loteamento (área pública)', 'Saldo inicial'],
  metodos: { linear: 'Cotas constantes (linear)', somaDigitos: 'Soma dos dígitos', unidades: 'Unidades produzidas' },
  tiposBaixa: ['Inservível', 'Alienação (leilão)', 'Doação', 'Furto / roubo', 'Extravio', 'Sinistro', 'Permuta', 'Fim da vida útil'],
  tiposTransferencia: { interna: 'Interna (entre unidades)', externa: 'Externa (empréstimo, cessão, conserto fora)', entidade: 'Entre entidades / fundos' },
  // Tipos de evento da linha do tempo
  eventos: {
    incorporacao: { nome: 'Incorporação', grupo: 'financeiro' },
    depreciacao: { nome: 'Depreciação', grupo: 'financeiro' },
    reavaliacao: { nome: 'Reavaliação', grupo: 'financeiro' },
    agregacao: { nome: 'Melhoria (agregação)', grupo: 'financeiro' },
    baixa: { nome: 'Baixa', grupo: 'financeiro' },
    estorno: { nome: 'Estorno', grupo: 'financeiro' },
    transferencia: { nome: 'Transferência', grupo: 'fisico' },
    desuso: { nome: 'Desuso', grupo: 'fisico' },
    retorno: { nome: 'Volta ao uso', grupo: 'fisico' },
    saida_externa: { nome: 'Saída externa', grupo: 'fisico' },
    vistoria: { nome: 'Vistoria', grupo: 'registro' },
    inventario: { nome: 'Conferência de inventário', grupo: 'registro' },
    manutencao: { nome: 'Manutenção', grupo: 'registro' },
    despesa: { nome: 'Despesa', grupo: 'registro' },
    abastecimento: { nome: 'Abastecimento', grupo: 'registro' },
    observacao: { nome: 'Observação', grupo: 'registro' },
    unidades: { nome: 'Unidades produzidas', grupo: 'registro' },
    alteracao: { nome: 'Alteração de dados', grupo: 'registro' }
  }
};

// ---------------------------------------------------------------------------
// Configurações (todas as opções do concorrente, explicadas)
// ---------------------------------------------------------------------------
VP.CONFIG_PADRAO = {
  // Geral
  obrigaContas: true,
  permiteBemCompraGlobal: true,
  codigoLocalizacaoManual: false,
  controleUsuarioPorUnidade: false,
  descricaoCompletaUnidade: true,
  incorporaSoLiquidados: false,
  filtroPorClassificacao: true,
  plaquetaAnteriorRelatorio: false,
  formaReavaliacao: 'informado',
  validaTransferenciaRetroativa: true,
  avisarTransferencia: 'painel',
  depreciacaoAnual: false,
  depreciacaoAutomatica: 'manual', // manual | balancete (ao gerar o balancete) | abrir (ao abrir o sistema)
  tombamentoAutomatico: true,
  obrigaUnidade: true,
  taxaPorEntidade: false,
  // Integrações (sistema independente: tudo por arquivo)
  integraCompras: false,
  integraContabilidade: true,
  importacaoItens: 'compra',
  integraArrecadacao: false,
  extratoCidadaoStatus: 'todos',
  doacaoFinanceiro: true,
  // Documentos
  termoDeBaixa: true,
  // Bens
  minhaResponsabilidadePadrao: false,
  codigoManual: false,
  usaAparencia: true,
  // Unidades
  movimentacaoPorUnidade: true,
  unidadePatrimonio: '',
  unidadeSolicitacaoBaixa: '',
  validaEntidadeOrgao: false,
  exigeAceiteTransferencia: true,
  // Avisos
  avisoSeguroDias: 30,
  avisoSeguroIntervalo: 7,
  avisoGarantiaDias: 30,
  reavaliacaoAnos: 4,
  limiteControle: 300, // itens de controle: valor abaixo do qual o bem pode ser só controlado (fora do balancete) — [A conferir] base legal
  avisoImovelDias: 60, // documentos e cessões de imóveis: avisar com esta antecedência
  // Usuário de demonstração (para "minha responsabilidade")
  usuarioResponsavelId: ''
};

// ---------------------------------------------------------------------------
// Armazenamento no navegador (IndexedDB). Tudo é carregado na memória ao abrir.
// Nada é apagado: "excluir" marca o registro como excluído (Lixeira).
// ---------------------------------------------------------------------------
VP.COLECOES = ['bens', 'eventos', 'unidades', 'responsaveis', 'classificacoes', 'produtos', 'contas', 'fornecedores',
  'motivos', 'entidades', 'comissoes', 'seguradoras', 'tiposGarantia', 'itensIncorporar', 'transferencias',
  'inventarios', 'fechamentos', 'reavaliacoes', 'exportacoes', 'filtrosSalvos', 'meta', 'registrosCampo',
  // Frota (veículo próprio continua em "bens")
  'veiculosLocados', 'abastecimentos', 'viagens', 'contratosLocacao', 'motoristas', 'planosManutencao', 'multas', 'documentosVeiculo',
  // Imóveis (etapa 5)
  'documentosImovel', 'cessoesImovel', 'pendenciasImovel',
  // Exportar e importar (planilhas)
  'importacoesPlanilha', 'importacoesAnexos',
  // Itens de controle (fora do balancete)
  'bensControle',
  // Manutenção, vistorias e equipes (etapa 6)
  'chamados', 'planosPreventiva', 'vistoriasPat', 'equipes',
  // Frota, segunda parte
  'pneus', 'reservasVeiculo', 'importacoesCartao', 'paradasVeiculo'];

VP.db = {
  _db: null,
  dados: {},
  nomeBanco: 'vitalpat-patrimonio-gestao',
  abrir() {
    return new Promise((ok, erro) => {
      const req = indexedDB.open(this.nomeBanco, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('docs', { keyPath: 'chave' });
      req.onsuccess = () => { this._db = req.result; ok(); };
      req.onerror = () => erro(req.error);
    });
  },
  async carregar() {
    await this.abrir();
    for (const c of VP.COLECOES) this.dados[c] = new Map();
    const todos = await new Promise((ok, erro) => {
      const r = this._db.transaction('docs').objectStore('docs').getAll();
      r.onsuccess = () => ok(r.result);
      r.onerror = () => erro(r.error);
    });
    for (const d of todos) {
      const [col] = d.chave.split('/');
      if (this.dados[col]) this.dados[col].set(d.id, d);
    }
    return todos.length;
  },
  lista(col, incluirExcluidos = false) {
    const v = [...this.dados[col].values()];
    return incluirExcluidos ? v : v.filter((x) => !x.excluido);
  },
  pega(col, id) { return this.dados[col].get(id) || null; },
  // Grava vários registros de uma vez, numa única operação
  gravar(col, docs) {
    const lista = Array.isArray(docs) ? docs : [docs];
    for (const d of lista) {
      if (!d.id) d.id = VP.u.id();
      d.chave = `${col}/${d.id}`;
      this.dados[col].set(d.id, d);
    }
    return new Promise((ok, erro) => {
      const t = this._db.transaction('docs', 'readwrite');
      const s = t.objectStore('docs');
      for (const d of lista) s.put(d);
      t.oncomplete = () => ok(lista);
      t.onerror = () => erro(t.error);
    });
  },
  async gravarVarias(mapa) {
    // mapa: { colecao: [docs] } — tudo numa transação
    const t = this._db.transaction('docs', 'readwrite');
    const s = t.objectStore('docs');
    for (const [col, docs] of Object.entries(mapa)) {
      for (const d of docs) {
        if (!d.id) d.id = VP.u.id();
        d.chave = `${col}/${d.id}`;
        this.dados[col].set(d.id, d);
        s.put(d);
      }
    }
    return new Promise((ok, erro) => { t.oncomplete = () => ok(); t.onerror = () => erro(t.error); });
  },
  async limparTudo() {
    const t = this._db.transaction('docs', 'readwrite');
    t.objectStore('docs').clear();
    await new Promise((ok) => { t.oncomplete = ok; });
    for (const c of VP.COLECOES) this.dados[c] = new Map();
  }
};

VP.config = () => Object.assign({}, VP.CONFIG_PADRAO, (VP.db.pega('meta', 'config') || {}).valores || {});
VP.salvarConfig = (valores) => VP.db.gravar('meta', { id: 'config', valores });

// Registra um evento na linha do tempo do bem (nunca apaga)
VP.novoEvento = (bemId, tipo, dados = {}) => ({
  id: VP.u.id(),
  bemId,
  tipo,
  data: dados.data || VP.Plataforma.hoje(),
  valor: dados.valor ?? null,
  descricao: dados.descricao || '',
  dados: dados.extra || {},
  loteId: dados.loteId || null,
  usuario: VP.sessao?.usuario || 'demonstração',
  criadoEm: VP.Plataforma.agoraISO(),
  cancelado: false,
  contabilizado: false
});

// Nome legível de qualquer cadastro
VP.nome = (col, id) => {
  const x = VP.db.pega(col, id);
  if (!x) return '—';
  if (col === 'unidades') return VP.config().descricaoCompletaUnidade ? `${x.codigo} · ${x.nome}` : x.nome;
  if (col === 'contas') return `${x.codigo} · ${x.nome}`;
  return x.nome || x.descricao || '—';
};
