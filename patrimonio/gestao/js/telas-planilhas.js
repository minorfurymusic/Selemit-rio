/* VitalPat Patrimônio · Gestão — Exportar e importar (planilhas do Excel) e anexos em lote.
   Exportar: bens em .xlsx com escolha de colunas, filtros e "uma aba por unidade". As colunas são as mesmas do modelo
   de importação, então a planilha exportada pode ser corrigida e importada de volta.
   Importar: modelo .xlsx → De/Para das colunas → prévia (novo, igual, alterado, erro) → aplicar o que foi marcado →
   tela de resultado → desfazer. O bem é achado pela plaqueta; o valor anterior vai para o histórico do bem. */
'use strict';
(function () {
  const VP = window.VP;
  const u = VP.u, esc = u.esc, ui = VP.ui, L = VP.LISTAS;
  const T = VP.telas;
  const P = VP.planilhas = {};
  const hoje = () => VP.Plataforma.hoje();
  const pega = (o, c) => c.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
  const poe = (o, c, v) => { const ks = c.split('.'); let x = o; for (const k of ks.slice(0, -1)) { if (x[k] == null || typeof x[k] !== 'object') x[k] = {}; x = x[k]; } x[ks.at(-1)] = v; };
  const pode = () => !VP.servidor?.ativo || VP.servidor.podeAlterar();

  // ------------------------------------------------------------------ conjuntos de bens (abas do modelo)
  P.CONJUNTOS = {
    movel: { nome: 'Bens móveis', tipos: ['movel', 'intangivel'], tipoPadrao: 'movel' },
    veiculo: { nome: 'Veículos', tipos: ['veiculo'], tipoPadrao: 'veiculo' },
    imovel: { nome: 'Imóveis', tipos: ['imovel', 'infraestrutura'], tipoPadrao: 'imovel' }
  };
  P.conjuntoDaAba = (nome) => { const n = u.normalizar(nome); return /veic/.test(n) ? 'veiculo' : /imov|terreno|predio/.test(n) ? 'imovel' : /controle/.test(n) ? 'controle' : /movel|moveis|bens/.test(n) ? 'movel' : null; };

  // ------------------------------------------------------------------ referências (unidade, classificação…) por nome ou código
  const norm = (t) => u.normalizar(t).replace(/\s+/g, ' ');
  const REFS = {
    unidades: { titulo: 'Unidade', achar: (t) => VP.db.lista('unidades').find((x) => norm(x.nome) === norm(t) || norm(x.codigo) === norm(t) || norm(`${x.codigo} · ${x.nome}`) === norm(t)), mostrar: (x) => x.nome },
    responsaveis: { titulo: 'Responsável', achar: (t) => VP.db.lista('responsaveis').find((x) => norm(x.nome) === norm(t) || (x.matricula && norm(x.matricula) === norm(t))), mostrar: (x) => x.nome },
    fornecedores: { titulo: 'Fornecedor', achar: (t) => { const d = String(t).replace(/\D/g, ''); return VP.db.lista('fornecedores').find((x) => norm(x.nome) === norm(t) || (d.length >= 11 && String(x.cnpj || x.documento || '').replace(/\D/g, '') === d)); }, mostrar: (x) => x.nome },
    classificacoes: { titulo: 'Classificação', achar: (t) => { const n = norm(t); return VP.db.lista('classificacoes').find((c) => norm(VP.caminhoClassificacao(c)) === n) || VP.db.lista('classificacoes').find((c) => norm(c.nome) === n) || VP.db.lista('classificacoes').find((c) => norm(c.codigo) === n); }, mostrar: (x) => VP.caminhoClassificacao(x) }
  };

  // ------------------------------------------------------------------ colunas (campos) da planilha de bens
  // tipo: texto | numero | moeda | data | ref | estado | opcao | bool ; g: conjuntos onde aparece ; obrig: obrigatório para bem novo ;
  // trava: motivo de não alterar bem que já existe (vai por outra tela, para ficar registrado)
  const TODOS = ['movel', 'veiculo', 'imovel'];
  P.CAMPOS = [
    { k: 'plaqueta', t: 'Plaqueta', tipo: 'texto', g: TODOS, ajuda: 'Número da plaquinha. Se o bem já existe, ele é achado por aqui e atualizado. Vazio = bem novo com plaqueta automática.' },
    { k: 'descricao', t: 'Descrição', tipo: 'texto', g: TODOS, obrig: true, ajuda: 'Nome do bem. Ex.: Cadeira giratória.' },
    { k: 'complemento', t: 'Complemento', tipo: 'texto', g: TODOS, ajuda: 'Descrição longa (opcional).' },
    { k: 'classificacaoId', t: 'Classificação', tipo: 'ref', ref: 'classificacoes', g: TODOS, obrig: true, trava: 'a classificação muda pela ficha do bem', ajuda: 'Nome da classificação como está na aba Listas.' },
    { k: 'unidadeId', t: 'Unidade', tipo: 'ref', ref: 'unidades', g: TODOS, obrigCfg: 'obrigaUnidade', trava: 'para mudar de unidade use Transferência (gera termo)', ajuda: 'Nome ou código da unidade (aba Listas).' },
    { k: 'localizacao', t: 'Local na unidade', tipo: 'texto', g: TODOS, ajuda: 'Ex.: Sala 12.' },
    { k: 'responsavelId', t: 'Responsável', tipo: 'ref', ref: 'responsaveis', g: TODOS, ajuda: 'Nome ou matrícula (aba Listas). Vazio = responsável da unidade.' },
    { k: 'dataAquisicao', t: 'Data de aquisição', tipo: 'data', g: TODOS, obrig: true, trava: 'a data de aquisição não muda depois de incluída', ajuda: 'dd/mm/aaaa.' },
    { k: 'valor', t: 'Valor de aquisição', tipo: 'moeda', g: TODOS, obrig: true, trava: 'o valor só muda por reavaliação, melhoria ou baixa', ler: (b) => VP.eventosDoBem(b.id).find((e) => e.tipo === 'incorporacao')?.valor ?? b.origem?.valorUnitario ?? '', ajuda: 'Em reais. Ex.: 1250,90.' },
    { k: 'estado', t: 'Estado', tipo: 'estado', g: TODOS, ajuda: 'Novo, Ótimo, Bom, Regular, Ruim ou Péssimo (ou 6 a 1).' },
    { k: 'situacaoAquisicao', t: 'Como entrou', tipo: 'opcao', opcoes: () => L.situacoesAquisicao, g: TODOS, soNovo: true, ajuda: 'Compra, Doação recebida… (aba Listas). Vazio = Compra.' },
    { k: 'fornecedorId', t: 'Fornecedor', tipo: 'ref', ref: 'fornecedores', g: TODOS, ajuda: 'Nome ou CNPJ do fornecedor já cadastrado.' },
    { k: 'nf.numero', t: 'Nota fiscal', tipo: 'texto', g: TODOS },
    { k: 'nf.emissao', t: 'Emissão da nota', tipo: 'data', g: TODOS, ajuda: 'dd/mm/aaaa.' },
    { k: 'origem.empenho', t: 'Empenho', tipo: 'texto', g: TODOS, ajuda: 'Ano/número.' },
    { k: 'detalhes.marca', t: 'Marca', tipo: 'texto', g: ['movel', 'veiculo'] },
    { k: 'detalhes.modelo', t: 'Modelo', tipo: 'texto', g: ['movel', 'veiculo'] },
    { k: 'detalhes.serie', t: 'Número de série', tipo: 'texto', g: ['movel'] },
    { k: 'veiculo.placa', t: 'Placa', tipo: 'texto', g: ['veiculo'], ajuda: 'Ex.: ABC1D23.' },
    { k: 'veiculo.renavam', t: 'RENAVAM', tipo: 'texto', g: ['veiculo'] },
    { k: 'veiculo.chassi', t: 'Chassi', tipo: 'texto', g: ['veiculo'] },
    { k: 'veiculo.combustivel', t: 'Combustível', tipo: 'opcao', opcoes: () => ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Elétrico', 'GNV'], g: ['veiculo'] },
    { k: 'veiculo.anoModelo', t: 'Ano/modelo', tipo: 'texto', g: ['veiculo'], ajuda: 'Ex.: 2022/2023.' },
    { k: 'imovel.matricula', t: 'Matrícula', tipo: 'texto', g: ['imovel'] },
    { k: 'imovel.cartorio', t: 'Cartório', tipo: 'texto', g: ['imovel'] },
    { k: 'imovel.situacaoRegistro', t: 'Situação do registro', tipo: 'opcao', opcoes: () => ['Registrado', 'Em regularização', 'Sem registro', 'Posse'], g: ['imovel'] },
    { k: 'imovel.motivoPendencia', t: 'O que impede o registro', tipo: 'texto', g: ['imovel'] },
    { k: 'imovel.uso', t: 'Classificação de uso', tipo: 'opcao', opcoes: () => ['Uso comum do povo', 'Uso especial', 'Dominical'], g: ['imovel'] },
    { k: 'imovel.afetado', t: 'Afetado', tipo: 'bool', g: ['imovel'], ajuda: 'Sim ou Não.' },
    { k: 'imovel.inscricaoIptu', t: 'Inscrição imobiliária (IPTU)', tipo: 'texto', g: ['imovel'] },
    { k: 'imovel.areaTerreno', t: 'Área do terreno (m²)', tipo: 'numero', g: ['imovel'] },
    { k: 'imovel.areaConstruida', t: 'Área construída (m²)', tipo: 'numero', g: ['imovel'] },
    { k: 'imovel.valorTerreno', t: 'Valor do terreno', tipo: 'moeda', g: ['imovel'] },
    { k: 'endereco.logradouro', t: 'Endereço', tipo: 'texto', g: ['imovel'] },
    { k: 'endereco.bairro', t: 'Bairro', tipo: 'texto', g: ['imovel'] },
    { k: 'endereco.cidade', t: 'Cidade', tipo: 'texto', g: ['imovel'] },
    { k: 'imovel.lat', t: 'Latitude', tipo: 'numero', g: ['imovel'], ajuda: 'Ex.: -27,2140 (copie do Google Maps).' },
    { k: 'imovel.lon', t: 'Longitude', tipo: 'numero', g: ['imovel'], ajuda: 'Ex.: -49,6430.' }
  ];
  // só na exportação (não são importados)
  P.EXTRAS = [
    { k: '_codigo', t: 'Código', ler: (b) => b.codigo },
    { k: '_tipo', t: 'Tipo', ler: (b) => L.tiposBem[b.tipo] || b.tipo },
    { k: '_status', t: 'Situação', ler: (b) => ({ ativo: 'Ativo', baixado: 'Baixado', manutencao: 'Em manutenção', desuso: 'Em desuso' }[b.status] || b.status) },
    { k: '_liquido', t: 'Valor contábil atual', ler: (b) => Math.round(VP.saldo(b).liquido * 100) / 100 },
    { k: '_fotos', t: 'Fotos e anexos', ler: (b) => (b.fotos || []).length + (b.anexos || []).filter((a) => !a.excluido).length }
  ];
  P.camposDe = (cj) => P.CAMPOS.filter((c) => c.g.includes(cj));
  const obrigatorio = (c) => c.obrig || (c.obrigCfg && VP.config()[c.obrigCfg]);

  // valor do bem → texto/número para a planilha
  P.lerCampo = (b, c) => {
    if (c.ler) return c.ler(b);
    const v = pega(b, c.k);
    if (v == null || v === '') return '';
    if (c.tipo === 'ref') { const x = VP.db.pega(c.ref, v); return x ? REFS[c.ref].mostrar(x) : ''; }
    if (c.tipo === 'data') return u.data(v);
    if (c.tipo === 'estado') return L.estados[v] || v;
    if (c.tipo === 'bool') return v ? 'Sim' : 'Não';
    return v;
  };

  // célula da planilha → valor do sistema ({ v } ou { erro })
  const serialParaISO = (n) => { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000); return d.toISOString().slice(0, 10); };
  // confere dia e mês de verdade (31/02 não existe; o navegador sozinho "rolaria" para março)
  const dataValida = (a, m, d) => { const dt = new Date(Date.UTC(Number(a), Number(m) - 1, Number(d))); return dt.getUTCFullYear() === Number(a) && dt.getUTCMonth() === Number(m) - 1 && dt.getUTCDate() === Number(d) ? dt.toISOString().slice(0, 10) : null; };
  P.lerData = (x) => {
    if (typeof x === 'number' && x > 20000 && x < 80000) return serialParaISO(x);
    const s = String(x).trim();
    let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
    if (m) { const a = m[3].length === 2 ? (Number(m[3]) > 50 ? '19' : '20') + m[3] : m[3]; return dataValida(a, m[2], m[1]); }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return dataValida(m[1], m[2], m[3]);
    return null;
  };
  P.converter = (c, bruto) => {
    if (bruto == null || String(bruto).trim() === '') return { vazio: true };
    const s = String(bruto).trim();
    switch (c.tipo) {
      case 'numero': case 'moeda': {
        const n = typeof bruto === 'number' ? bruto : u.num(s.replace(/^R\$\s*/i, ''));
        return n == null ? { erro: `"${s}" não é um número` } : { v: n };
      }
      case 'data': { const d = P.lerData(bruto); return d ? { v: d } : { erro: `"${s}" não é uma data (use dd/mm/aaaa)` }; }
      case 'estado': {
        const n = Number(s); if (L.estados[n]) return { v: n };
        const k = Object.entries(L.estados).find(([, nome]) => norm(nome) === norm(s));
        return k ? { v: Number(k[0]) } : { erro: `estado "${s}" não existe (use Novo, Ótimo, Bom, Regular, Ruim ou Péssimo)` };
      }
      case 'bool': return /^(s|sim|x|1|true|verdadeiro)$/i.test(s) ? { v: true } : /^(n|nao|não|0|false|falso)$/i.test(s) ? { v: false } : { erro: `"${s}": use Sim ou Não` };
      case 'opcao': { const o = c.opcoes().find((x) => norm(x) === norm(s)); return o ? { v: o } : { erro: `"${s}" não está na lista (${c.opcoes().join(', ')})` }; }
      case 'ref': { const x = REFS[c.ref].achar(s); return x ? { v: x.id } : { erro: `${REFS[c.ref].titulo.toLowerCase()} "${s}" não existe no cadastro (veja a aba Listas do modelo)` }; }
      default: return { v: typeof bruto === 'number' ? String(bruto) : s };
    }
  };

  // ================================================================== MODELO PARA IMPORTAÇÃO
  P.baixarModelo = () => {
    const un = VP.db.lista('unidades')[0], cl = (t) => VP.db.lista('classificacoes').find((c) => P.CONJUNTOS[t].tipos.includes(VP.dadosDaClassificacao(c.id).tipoBem || 'movel') && c.nivel !== 'grupo');
    const exemplo = (cj) => {
      const ex = { plaqueta: '', descricao: 'EXEMPLO — apague esta linha', classificacaoId: cl(cj) ? VP.caminhoClassificacao(cl(cj)) : '', unidadeId: un?.nome || '', dataAquisicao: '15/03/2024', valor: 1250.9, estado: 'Novo', situacaoAquisicao: 'Compra', 'veiculo.placa': 'ABC1D23', 'veiculo.combustivel': 'Flex', 'veiculo.anoModelo': '2023/2024', 'imovel.situacaoRegistro': 'Registrado', 'imovel.uso': 'Uso especial', 'imovel.afetado': 'Sim' };
      return P.camposDe(cj).map((c) => ex[c.k] ?? '');
    };
    const abas = Object.entries(P.CONJUNTOS).map(([cj, x]) => ({ nome: x.nome, cabecalho: P.camposDe(cj).map((c) => c.t), linhas: [exemplo(cj)] }));
    if (VP.controle) abas.push(VP.controle.abaModelo());
    const instr = [
      ['Como usar este modelo', ''],
      ['1', 'Preencha uma linha por bem, na aba do tipo certo (Bens móveis, Veículos, Imóveis' + (VP.controle ? ', Itens de controle' : '') + '). Não mude os títulos da primeira linha.'],
      ['2', 'Apague as linhas de EXEMPLO (o sistema recusa linha que começa com "EXEMPLO").'],
      ['3', 'Bem que já existe no sistema: informe a Plaqueta. Só as colunas preenchidas são atualizadas; célula vazia não apaga nada. O valor anterior fica no histórico do bem.'],
      ['4', 'Não mudam pela planilha (para ficar registrado): valor (use Reavaliação), unidade (use Transferência), data de aquisição e classificação.'],
      ['5', 'Nomes de unidades, classificações, responsáveis e fornecedores devem ser iguais aos da aba Listas.'],
      ['6', 'Datas: dd/mm/aaaa. Valores: número, com vírgula nos centavos (1250,90).'],
      ['7', 'No sistema: Exportar e importar → Importar → escolha o arquivo → confira a prévia → Importar o que está marcado. Dá para desfazer depois.'],
      ['', ''], ['Coluna', 'O que colocar']
    ];
    const vistos = new Set();
    for (const cj of Object.keys(P.CONJUNTOS)) for (const c of P.camposDe(cj)) if (!vistos.has(c.k)) { vistos.add(c.k); instr.push([c.t + (obrigatorio(c) ? ' (obrigatória para bem novo)' : ''), [c.ajuda || '', c.trava ? `Não muda em bem que já existe: ${c.trava}.` : '', c.soNovo ? 'Só vale para bem novo.' : ''].filter(Boolean).join(' ')]); }
    if (VP.controle) instr.push(['', ''], ...VP.controle.instrucoes());
    const listas = {
      Unidades: VP.db.lista('unidades').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map((x) => x.nome),
      'Classificações': VP.db.lista('classificacoes').map((c) => VP.caminhoClassificacao(c)).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      'Responsáveis': VP.db.lista('responsaveis').map((x) => x.nome).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      Fornecedores: VP.db.lista('fornecedores').map((x) => x.nome).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      Estados: Object.values(L.estados),
      'Como entrou': L.situacoesAquisicao,
      'Situação do registro': ['Registrado', 'Em regularização', 'Sem registro', 'Posse'],
      'Classificação de uso': ['Uso comum do povo', 'Uso especial', 'Dominical'],
      'Combustível': ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Elétrico', 'GNV']
    };
    const cols = Object.keys(listas), max = Math.max(...Object.values(listas).map((l) => l.length));
    abas.push({ nome: 'Instruções', cabecalho: ['Item', 'Explicação'], linhas: instr, larguras: [34, 110], quebrar: true });
    abas.push({ nome: 'Listas', cabecalho: cols, linhas: Array.from({ length: max }, (_, i) => cols.map((c) => listas[c][i] ?? '')) });
    VP.baixarXLSX('modelo-importacao-bens', abas);
  };

  // ================================================================== EXPORTAR
  const filtrar = (cj, f) => {
    let l = VP.db.lista('bens').filter((b) => P.CONJUNTOS[cj].tipos.includes(b.tipo));
    if (f.unidadeId) l = l.filter((b) => b.unidadeId === f.unidadeId);
    if (f.status === 'ativos') l = l.filter((b) => b.status !== 'baixado'); else if (f.status === 'baixados') l = l.filter((b) => b.status === 'baixado');
    if (f.local) l = l.filter((b) => u.normalizar(b.localizacao).includes(u.normalizar(f.local)));
    if (f.grupoId) l = l.filter((b) => VP.grupoDe(b.classificacaoId)?.id === f.grupoId);
    return l.sort((a, b) => (a.codigo || 0) - (b.codigo || 0));
  };
  P.colunasExportar = (cj) => P.camposDe(cj).concat(P.EXTRAS);
  P.exportarBens = (cj, f, chaves, porUnidade) => {
    const cols = P.colunasExportar(cj).filter((c) => chaves.includes(c.k));
    const bens = filtrar(cj, f);
    const linha = (b) => cols.map((c) => P.lerCampo(b, c));
    const cab = cols.map((c) => c.t);
    let abas;
    if (porUnidade) {
      const grupos = new Map();
      for (const b of bens) { const k = b.unidadeId || ''; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(b); }
      abas = [...grupos.entries()].sort((a, b) => VP.nome('unidades', a[0]).localeCompare(VP.nome('unidades', b[0]), 'pt-BR')).map(([id, l]) => ({ nome: id ? VP.nome('unidades', id) : 'Sem unidade', cabecalho: cab, linhas: l.map(linha) }));
      if (!abas.length) abas = [{ nome: P.CONJUNTOS[cj].nome, cabecalho: cab, linhas: [] }];
    } else abas = [{ nome: P.CONJUNTOS[cj].nome, cabecalho: cab, linhas: bens.map(linha) }];
    VP.baixarXLSX(u.normalizar(P.CONJUNTOS[cj].nome).replace(/\s+/g, '-'), abas);
    return bens.length;
  };
  // Outras listas do sistema (cada uma tem o botão "Baixar planilha" na própria tela)
  P.OUTRAS = [
    ['Bens', [['#bens/moveis', 'Bens móveis'], ['#bens/imoveis', 'Bens imóveis'], ['#cadastros/unidades', 'Bens de uma unidade (abra a unidade)'], ['#entradas', 'Entradas (itens a incorporar)'], ['#transferencias', 'Transferências'], ['#historico', 'Histórico de movimentações']]],
    ['Financeiro', [['#financeiro/melhorias', 'Melhorias'], ['#financeiro/baixas', 'Baixas'], ['#financeiro/reavaliacao', 'Reavaliações (blocos)'], ['#financeiro/contabilidade', 'Arquivos para a contabilidade'], ['#relatorios', 'Todos os relatórios (balancete, depreciação, inventário…)']]],
    ['Inventário', [['#inventario', 'Inventários feitos e andamento por unidade']]],
    ['Imóveis', [['#imoveis/demonstrativo', 'Demonstrativo (TCE/SC)'], ['#imoveis/documentos', 'Documentos'], ['#imoveis/cessoes', 'Cessões'], ['#imoveis/pendencias', 'Pendências']]],
    ['Frota', [['#frota/veiculos', 'Veículos'], ['#frota/abastecimentos', 'Abastecimentos'], ['#frota/viagens', 'Viagens'], ['#frota/contratos', 'Contratos, conferência e paradas'], ['#frota/motoristas', 'Motoristas'], ['#frota/manutencao', 'Manutenção'], ['#frota/multas', 'Multas'], ['#frota/documentos', 'Documentos'], ['#frota/pneus', 'Pneus'], ['#frota/reservas', 'Reservas'], ['#frota/cartao', 'Cartão-combustível (arquivos importados)']]],
    ['Manutenção', [['#manutencao/chamados', 'Chamados'], ['#manutencao/preventiva', 'Preventiva'], ['#manutencao/vistorias', 'Vistorias'], ['#manutencao/equipes', 'Equipes'], ['#manutencao', 'Custo por unidade (painel)']]],
    ['Cadastros e outros', [['#cadastros/unidades', 'Todos os cadastros (uma aba para cada)'], ['#lixeira', 'Lixeira']]]
  ];

  // ================================================================== IMPORTAR: ler arquivo, De/Para, prévia
  const st = () => (VP.estado.impBens = VP.estado.impBens || { abas: null, previa: null });
  const sugerir = (titulo, cj) => {
    const n = norm(titulo).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const campos = cj === 'controle' && VP.controle ? VP.controle.CAMPOS : P.camposDe(cj);
    return (campos.find((c) => norm(c.t).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() === n) || campos.find((c) => (c.apelidos || []).some((a) => n === a)) || {}).k || '';
  };
  P.lerArquivo = async (arquivo) => {
    const abas = await VP.lerArquivoPlanilha(arquivo);
    const s = st();
    s.arquivo = arquivo.name; s.previa = null;
    const modelos = ui.pref.ler('depara-bens', {});
    s.abas = abas.filter((a) => !/^(instru|listas)/.test(norm(a.nome))).map((a) => {
      const linhas = a.linhas.filter((l) => l.some((x) => x !== '' && x != null));
      const cab = (linhas[0] || []).map((x) => String(x ?? '').trim());
      const cj = P.conjuntoDaAba(a.nome) || 'movel';
      const salvo = modelos[cj];
      return { nome: a.nome, cj, cab, linhas: linhas.slice(1), usar: linhas.length > 1, mapa: cab.map((t) => (salvo && salvo[norm(t)] !== undefined ? salvo[norm(t)] : sugerir(t, cj))) };
    });
    return s;
  };
  P.gerarPrevia = () => {
    const s = st();
    const itens = [];
    const vistas = new Map(); // plaqueta → linha
    const todos = VP.db.lista('bens', true);
    for (const a of s.abas.filter((x) => x.usar && x.cj !== 'controle')) {
      const campos = P.camposDe(a.cj);
      a.linhas.forEach((lin, i) => {
        const nLinha = i + 2;
        const it = { aba: a.nome, cj: a.cj, linha: nLinha, valores: {}, erros: [], avisos: [], mudancas: [] };
        a.mapa.forEach((k, col) => {
          if (!k) return;
          const c = campos.find((x) => x.k === k); if (!c) return;
          const r = P.converter(c, lin[col]);
          if (r.erro) it.erros.push(`${c.t}: ${r.erro}`); else if (!r.vazio) it.valores[k] = r.v;
        });
        it.plaqueta = it.valores.plaqueta ? String(it.valores.plaqueta).trim() : '';
        it.descricao = it.valores.descricao || '';
        if (/^exemplo/i.test(it.descricao)) it.erros.unshift('Linha de EXEMPLO do modelo: apague-a da planilha');
        if (it.plaqueta) {
          if (vistas.has(it.plaqueta)) it.erros.push(`Plaqueta repetida no arquivo (já está em ${vistas.get(it.plaqueta)})`);
          else vistas.set(it.plaqueta, `${a.nome}, linha ${nLinha}`);
        }
        const existe = it.plaqueta ? todos.find((b) => String(b.plaqueta) === it.plaqueta) : null;
        if (existe && existe.excluido) it.erros.push(`A plaqueta ${it.plaqueta} é de um bem que está na Lixeira; restaure-o antes`);
        else if (existe) {
          it.bemId = existe.id;
          if (!P.CONJUNTOS[a.cj].tipos.includes(existe.tipo)) it.avisos.push(`Este bem é ${L.tiposBem[existe.tipo] || existe.tipo}, mas está na aba ${a.nome}`);
          if (existe.status === 'baixado') it.avisos.push('Bem baixado: só os dados descritivos são atualizados');
          for (const [k, v] of Object.entries(it.valores)) {
            if (k === 'plaqueta') continue;
            const c = campos.find((x) => x.k === k);
            const antes = c.ler ? c.ler(existe) : pega(existe, k);
            const igual = typeof v === 'number' ? antes !== '' && antes != null && Number(antes) === v : String(antes ?? '') === String(v);
            if (igual) continue;
            if (c.trava) { it.avisos.push(`${c.t} não foi alterado: ${c.trava}`); continue; }
            if (c.soNovo) continue;
            it.mudancas.push({ k, t: c.t, antes: antes ?? '', depois: v });
          }
          it.classe = it.erros.length ? 'erro' : it.mudancas.length ? 'alterado' : 'igual';
        } else {
          for (const c of campos) if (obrigatorio(c) && it.valores[c.k] == null) it.erros.push(`${c.t} é obrigatória para bem novo`);
          if (it.valores.valor != null && it.valores.valor < 0) it.erros.push('Valor negativo');
          it.classe = it.erros.length ? 'erro' : 'novo';
        }
        it.marcado = it.classe === 'novo' || it.classe === 'alterado';
        itens.push(it);
      });
    }
    if (VP.controle) for (const a of s.abas.filter((x) => x.usar && x.cj === 'controle')) itens.push(...VP.controle.previaImportacao(a));
    s.previa = { itens, criadoEm: VP.Plataforma.agoraISO() };
    return s.previa;
  };

  // ================================================================== IMPORTAR: aplicar e desfazer
  const mostrarValor = (c, v) => (v == null || v === '' ? '—' : c?.tipo === 'ref' ? REFS[c.ref].mostrar(VP.db.pega(c.ref, v) || { nome: v }) : c?.tipo === 'data' ? u.data(v) : c?.tipo === 'estado' ? L.estados[v] || v : c?.tipo === 'moeda' ? u.moeda(v) : c?.tipo === 'bool' ? (v ? 'Sim' : 'Não') : String(v));
  P.aplicar = async () => {
    const s = st();
    const marcados = s.previa.itens.filter((x) => x.marcado && (x.classe === 'novo' || x.classe === 'alterado'));
    const reg = { id: u.id(), data: VP.Plataforma.agoraISO(), arquivo: s.arquivo, usuario: VP.sessao?.usuario || 'demonstração', novos: [], alterados: [], controleNovos: [], controleAlterados: [], qtd: 0 };
    const bens = [], eventos = [], sucesso = [], falhas = [];
    let codigo = VP.proximoCodigo();
    for (const it of marcados.filter((x) => x.cj !== 'controle')) {
      try {
        if (it.classe === 'novo') {
          const v = it.valores;
          const { bens: bb, eventos: ee } = VP.montarBens({ tipo: P.CONJUNTOS[it.cj].tipoPadrao, descricao: v.descricao, complemento: v.complemento, classificacaoId: v.classificacaoId, unidadeId: v.unidadeId, responsavelId: v.responsavelId, localizacao: v.localizacao, dataAquisicao: v.dataAquisicao, dataIncorporacao: hoje(), valor: v.valor, estado: v.estado || 5, situacaoAquisicao: v.situacaoAquisicao || 'Compra', fornecedorId: v.fornecedorId, quantidade: 1, origemTexto: 'importação por planilha' }, codigo);
          const b = bb[0];
          const dcTipo = VP.dadosDaClassificacao(v.classificacaoId).tipoBem;
          b.tipo = P.CONJUNTOS[it.cj].tipos.includes(dcTipo) ? dcTipo : P.CONJUNTOS[it.cj].tipoPadrao;
          if (it.plaqueta) b.plaqueta = it.plaqueta;
          for (const [k, x] of Object.entries(v)) if (/^(nf|origem|detalhes|veiculo|imovel|endereco)\./.test(k)) poe(b, k, x);
          if (b.tipo !== 'veiculo' && b.veiculo && !Object.keys(b.veiculo).length) b.veiculo = null;
          codigo++;
          bens.push(b); eventos.push(...ee);
          reg.novos.push(b.id);
          sucesso.push(`Novo: ${b.plaqueta} · ${b.descricao}`);
        } else {
          const b = VP.db.pega('bens', it.bemId);
          const antes = {};
          for (const m of it.mudancas) { antes[m.k] = pega(b, m.k) ?? null; poe(b, m.k, m.depois); }
          const campos = P.camposDe(it.cj);
          bens.push(b);
          eventos.push(VP.novoEvento(b.id, 'alteracao', { descricao: `Atualizado pela importação de planilha (${s.arquivo})`, extra: { mudancas: it.mudancas.map((m) => { const c = campos.find((x) => x.k === m.k); return { campo: m.t, antes: mostrarValor(c, m.antes), depois: mostrarValor(c, m.depois) }; }) } }));
          reg.alterados.push({ id: b.id, antes });
          sucesso.push(`Atualizado: ${b.plaqueta} · ${b.descricao} (${it.mudancas.map((m) => m.t).join(', ')})`);
        }
      } catch (e) { falhas.push({ item: `${it.aba}, linha ${it.linha}`, motivo: e.message }); }
    }
    const extra = { bensControle: [] };
    if (VP.controle) VP.controle.aplicarImportacao(marcados.filter((x) => x.cj === 'controle'), reg, extra, sucesso, falhas);
    for (const it of s.previa.itens.filter((x) => x.classe === 'erro')) falhas.push({ item: `${it.aba}, linha ${it.linha}${it.descricao ? ' · ' + it.descricao : ''}`, motivo: it.erros.join('; ') });
    reg.qtd = sucesso.length;
    const grava = { bens, eventos, importacoesPlanilha: [reg] };
    if (extra.bensControle.length) grava.bensControle = extra.bensControle;
    if (sucesso.length) await VP.db.gravarVarias(grava);
    s.previa = null; s.abas = null;
    ui.resultado({ titulo: 'Resultado da importação', sucesso, falhas, extra: sucesso.length ? '<p class="ajuda">Se algo saiu errado, use "Desfazer" na lista de importações feitas.</p>' : '' });
    return { sucesso, falhas, reg };
  };
  P.desfazer = async (reg) => {
    const bens = [], eventos = [], falhas = [], sucesso = [];
    for (const id of reg.novos) {
      const b = VP.db.pega('bens', id);
      if (!b) { falhas.push({ item: id, motivo: 'Bem não encontrado (já excluído?)' }); continue; }
      const mov = VP.eventosDoBem(b.id).filter((e) => !['incorporacao', 'alteracao'].includes(e.tipo));
      if (mov.length) { falhas.push({ item: `${b.plaqueta} · ${b.descricao}`, motivo: 'Já tem movimentações depois da importação; exclua pela ficha se for o caso' }); continue; }
      b.excluido = true; b.excluidoEm = VP.Plataforma.agoraISO();
      bens.push(b); eventos.push(VP.novoEvento(b.id, 'alteracao', { descricao: 'Importação desfeita: movido para a Lixeira' }));
      sucesso.push(`Para a Lixeira: ${b.plaqueta} · ${b.descricao}`);
    }
    for (const a of reg.alterados) {
      const b = VP.db.pega('bens', a.id);
      if (!b) { falhas.push({ item: a.id, motivo: 'Bem não encontrado' }); continue; }
      for (const [k, v] of Object.entries(a.antes)) poe(b, k, v);
      bens.push(b); eventos.push(VP.novoEvento(b.id, 'alteracao', { descricao: 'Importação de planilha desfeita: valores anteriores restaurados', extra: { mudancas: Object.keys(a.antes).map((k) => ({ campo: (P.CAMPOS.find((c) => c.k === k) || {}).t || k, antes: '(importado)', depois: String(a.antes[k] ?? '') })) } }));
      sucesso.push(`Restaurado: ${b.plaqueta} · ${b.descricao}`);
    }
    const grava = { bens, eventos };
    if (VP.controle) VP.controle.desfazerImportacao(reg, grava, sucesso, falhas);
    reg.desfeitoEm = VP.Plataforma.agoraISO();
    grava.importacoesPlanilha = [reg];
    await VP.db.gravarVarias(grava);
    ui.resultado({ titulo: 'Importação desfeita', sucesso, falhas });
  };

  // ================================================================== TELA
  const ABAS = [['exportar', 'Exportar'], ['importar', 'Importar'], ['anexos', 'Anexos em lote']];
  T.planilhas = (aba = 'exportar') => {
    if (!ABAS.some(([k]) => k === aba)) aba = 'exportar';
    const nav = `<nav class="abas">${ABAS.map(([k, n]) => `<a href="#planilhas/${k}" class="${k === aba ? 'ativa' : ''}">${n}</a>`).join('')}</nav>`;
    if (aba === 'anexos') return VP.anexosLote ? VP.anexosLote.tela(nav) : { titulo: 'Exportar e importar', html: nav };
    if (aba === 'importar') return telaImportar(nav);
    return telaExportar(nav);
  };

  const telaExportar = (nav) => {
    const f = VP.estado.expBens = VP.estado.expBens || { cj: 'movel', unidadeId: '', status: 'ativos', local: '', grupoId: '', porUnidade: false };
    const cjs = Object.assign({}, Object.fromEntries(Object.entries(P.CONJUNTOS).map(([k, x]) => [k, x.nome])), VP.controle ? { controle: 'Itens de controle' } : {});
    const ehControle = f.cj === 'controle';
    const cols = ehControle ? VP.controle.colunasExportar() : P.colunasExportar(f.cj);
    const salvas = ui.pref.ler('exp-colunas-' + f.cj);
    const modelos = ui.pref.ler('exp-modelos-' + f.cj, {});
    const qtd = ehControle ? VP.controle.filtrar(f).length : filtrar(f.cj, f).length;
    const grupos = VP.db.lista('classificacoes').filter((c) => !c.paiId);
    return {
      titulo: 'Exportar e importar',
      acoes: '<button class="botao" data-modelo-imp>Baixar modelo para importação</button>',
      html: `${nav}
        <section class="cartao"><h3>Exportar em lote (Excel)</h3>
          <p class="ajuda">Escolha o que exportar, filtre e marque as colunas. As colunas são as mesmas do modelo de importação: dá para corrigir no Excel e importar de volta.</p>
          <div class="linha-filtros">
            <label>O que exportar <select data-exp="cj">${Object.entries(cjs).map(([k, n]) => `<option value="${k}" ${k === f.cj ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
            <label>Unidade <select data-exp="unidadeId"><option value="">Todas</option>${VP.db.lista('unidades').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map((x) => `<option value="${esc(x.id)}" ${x.id === f.unidadeId ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
            <label>Local contém <input data-exp="local" value="${esc(f.local)}" size="10" placeholder="Ex.: Sala 12"></label>
            ${ehControle ? '' : `<label>Grupo <select data-exp="grupoId"><option value="">Todos</option>${grupos.map((g) => `<option value="${esc(g.id)}" ${g.id === f.grupoId ? 'selected' : ''}>${esc(g.nome)}</option>`).join('')}</select></label>`}
            <label>Situação <select data-exp="status"><option value="ativos" ${f.status === 'ativos' ? 'selected' : ''}>Ativos</option><option value="baixados" ${f.status === 'baixados' ? 'selected' : ''}>${ehControle ? 'Com baixa' : 'Baixados'}</option><option value="todos" ${f.status === 'todos' ? 'selected' : ''}>Todos</option></select></label>
            <label class="linha-check"><input type="checkbox" data-exp="porUnidade" ${f.porUnidade ? 'checked' : ''}> Uma aba por unidade</label>
          </div>
          <p><b>${u.inteiro(qtd)}</b> item(ns) neste filtro.</p>
          ${Object.keys(modelos).length ? `<label>Modelo de colunas salvo <select data-exp-modelo><option value="">—</option>${Object.keys(modelos).map((m) => `<option>${esc(m)}</option>`).join('')}</select></label>` : ''}
          <div class="linha-botoes"><button type="button" class="botao pequeno" data-exp-todas>Marcar todas</button><button type="button" class="botao pequeno" data-exp-nenhuma>Desmarcar todas</button></div>
          <div class="lista-marcar colunas" id="exp-colunas">${cols.map((c) => `<label><input type="checkbox" value="${esc(c.k)}" ${!salvas || salvas.includes(c.k) ? 'checked' : ''}> ${esc(c.t)}</label>`).join('')}</div>
          <div class="linha-botoes"><label>Salvar esta escolha como modelo (opcional) <input data-exp-nome-modelo placeholder="Ex.: Para o sistema da contabilidade"></label></div>
          <p><button class="botao primario" data-exportar ${qtd ? '' : 'disabled'}>Baixar Excel</button></p>
        </section>
        <section class="cartao"><h3>Outras listas</h3><p class="ajuda">Cada lista abaixo tem o botão <b>Baixar planilha</b> na própria tela (Excel, CSV ou JSON, com escolha das colunas). Se marcar linhas na lista, só elas saem.</p>
          <div class="grade-links">${P.OUTRAS.map(([g, l]) => `<div><h4>${esc(g)}</h4><ul class="lista-simples">${l.map(([h, n]) => `<li><a href="${h}">${esc(n)}</a></li>`).join('')}</ul></div>`).join('')}</div>
        </section>`,
      ligar() {
        const re = () => VP.app.render();
        document.querySelector('[data-modelo-imp]').addEventListener('click', P.baixarModelo);
        document.querySelectorAll('[data-exp]').forEach((el) => el.addEventListener('change', () => { f[el.dataset.exp] = el.type === 'checkbox' ? el.checked : el.value; re(); }));
        const caixas = () => [...document.querySelectorAll('#exp-colunas input')];
        document.querySelector('[data-exp-todas]').addEventListener('click', () => caixas().forEach((i) => { i.checked = true; }));
        document.querySelector('[data-exp-nenhuma]').addEventListener('click', () => caixas().forEach((i) => { i.checked = false; }));
        document.querySelector('[data-exp-modelo]')?.addEventListener('change', (e) => { const m = modelos[e.target.value]; if (m) caixas().forEach((i) => { i.checked = m.includes(i.value); }); });
        document.querySelector('[data-exportar]').addEventListener('click', () => {
          const ks = caixas().filter((i) => i.checked).map((i) => i.value);
          if (!ks.length) return ui.aviso('Marque pelo menos uma coluna.', 'erro');
          ui.pref.gravar('exp-colunas-' + f.cj, ks);
          const nm = document.querySelector('[data-exp-nome-modelo]').value.trim();
          if (nm) { modelos[nm] = ks; ui.pref.gravar('exp-modelos-' + f.cj, modelos); }
          const n = ehControle ? VP.controle.exportar(f, ks) : P.exportarBens(f.cj, f, ks, f.porUnidade);
          ui.aviso(`Planilha com ${u.inteiro(n)} item(ns) baixada.`);
        });
      }
    };
  };

  const CLASSE = { novo: ['im-bom', 'Novo'], igual: ['im-neutro', 'Igual (nada muda)'], alterado: ['im-regular', 'Alterado'], erro: ['im-ruim', 'Erro'] };
  const telaImportar = (nav) => {
    const s = st();
    const hist = VP.db.lista('importacoesPlanilha').sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const camposDoCj = (cj) => (cj === 'controle' && VP.controle ? VP.controle.CAMPOS : P.camposDe(cj));
    const cjs = Object.assign({}, Object.fromEntries(Object.entries(P.CONJUNTOS).map(([k, x]) => [k, x.nome])), VP.controle ? { controle: 'Itens de controle' } : {});
    let corpo = '';
    if (s.previa) {
      const it = s.previa.itens;
      const n = (c) => it.filter((x) => x.classe === c).length;
      corpo = `<section class="cartao" id="previa-imp"><h3>Prévia — ${esc(s.arquivo)}</h3>
        <p class="ajuda">Nada foi gravado ainda. Confira, desmarque o que não quiser e clique em <b>Importar o que está marcado</b>.</p>
        <div class="resumo-linha">${VP.graficos.numero('Novos', u.inteiro(n('novo')))}${VP.graficos.numero('Alterados', u.inteiro(n('alterado')))}${VP.graficos.numero('Iguais', u.inteiro(n('igual')))}${VP.graficos.numero('Com erro', u.inteiro(n('erro')))}</div>
        <div class="linha-botoes"><label>Mostrar <select data-imp-filtro><option value="">Todos</option>${Object.entries(CLASSE).map(([k, [, nm]]) => `<option value="${k}">${nm}</option>`).join('')}</select></label>
          <button type="button" class="botao pequeno" data-imp-marcar="1">Marcar todos os válidos</button><button type="button" class="botao pequeno" data-imp-marcar="0">Desmarcar todos</button></div>
        <div class="tabela-rolagem"><table class="tabela" id="tab-previa-imp"><thead><tr><th></th><th>Situação</th><th>Aba, linha</th><th>Plaqueta</th><th>Descrição</th><th>O que acontece</th></tr></thead><tbody>
        ${it.map((x, i) => `<tr data-classe="${x.classe}"><td>${x.classe === 'novo' || x.classe === 'alterado' ? `<input type="checkbox" data-imp-item="${i}" ${x.marcado ? 'checked' : ''} aria-label="Importar esta linha">` : ''}</td>
          <td><span class="selo-status ${CLASSE[x.classe][0]}">${CLASSE[x.classe][1]}</span></td><td>${esc(x.aba)}, ${x.linha}</td><td>${esc(x.plaqueta || (x.classe === 'novo' ? '(automática)' : ''))}</td><td>${esc(x.descricao || (x.bemId ? VP.db.pega('bens', x.bemId)?.descricao : '') || x.codigoControle || '')}</td>
          <td>${x.erros.length ? `<span class="erro-txt">${esc(x.erros.join('; '))}</span>` : x.classe === 'novo' ? 'Será incluído' : x.classe === 'igual' ? 'Nada muda' : ''}
            ${x.mudancas.length ? `<ul class="lista-mudancas">${x.mudancas.map((m) => { const c = camposDoCj(x.cj).find((y) => y.k === m.k); return `<li><b>${esc(m.t)}</b>: ${esc(mostrarValor(c, m.antes))} → ${esc(mostrarValor(c, m.depois))}</li>`; }).join('')}</ul>` : ''}
            ${x.avisos.length ? `<div class="aviso-txt">${esc(x.avisos.join('; '))}</div>` : ''}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="linha-botoes"><button class="botao primario" data-imp-aplicar>Importar o que está marcado</button> <button class="botao" data-imp-descartar>Descartar</button></p></section>`;
    } else if (s.abas) {
      corpo = `<section class="cartao" id="depara-imp"><h3>Colunas do arquivo — ${esc(s.arquivo)}</h3>
        <p class="ajuda">O sistema ligou cada coluna da planilha a uma informação do bem pelo título. Confira e corrija o que estiver errado; "— não importar —" ignora a coluna.</p>
        ${s.abas.map((a, ai) => `<div class="cartao secao"><header><label class="linha-check"><input type="checkbox" data-imp-usar="${ai}" ${a.usar ? 'checked' : ''}> Aba <b>${esc(a.nome)}</b> (${u.inteiro(a.linhas.length)} linhas)</label>
            <label>É de <select data-imp-cj="${ai}">${Object.entries(cjs).map(([k, n]) => `<option value="${k}" ${k === a.cj ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label></header>
          <div class="grade-depara">${a.cab.map((t, ci) => `<label>${esc(t || `(coluna ${ci + 1} sem título)`)} <select data-imp-mapa="${ai}:${ci}"><option value="">— não importar —</option>${camposDoCj(a.cj).map((c) => `<option value="${esc(c.k)}" ${c.k === a.mapa[ci] ? 'selected' : ''}>${esc(c.t)}</option>`).join('')}</select></label>`).join('')}</div></div>`).join('')}
        <p class="linha-botoes"><label class="linha-check"><input type="checkbox" data-imp-salvar-mapa checked> Lembrar estas ligações para a próxima vez</label></p>
        <p class="linha-botoes"><button class="botao primario" data-imp-previa>Ver a prévia</button> <button class="botao" data-imp-descartar>Cancelar</button></p></section>`;
    }
    return {
      titulo: 'Exportar e importar',
      acoes: '<button class="botao" data-modelo-imp>Baixar modelo para importação</button>',
      html: `${nav}
        <section class="cartao"><h3>Importar bens pela planilha do Excel</h3>
          <ol class="lista-simples"><li>Baixe o <b>modelo</b> (botão acima) e preencha no Excel. Ou exporte os bens, corrija e importe de volta.</li><li>Escolha o arquivo aqui. Nada é gravado antes da sua confirmação.</li><li>Confira as colunas e a prévia; importe o que estiver marcado.</li></ol>
          ${pode() ? '<label class="botao primario">Escolher arquivo (.xlsx ou .csv)<input type="file" accept=".xlsx,.csv,.txt" data-imp-arquivo hidden></label>' : '<p class="aviso-inline">Seu acesso é só de consulta.</p>'}
        </section>
        ${corpo}
        <section class="cartao"><h3>Importações feitas</h3>${hist.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Data</th><th>Arquivo</th><th>Quem</th><th class="num">Novos</th><th class="num">Alterados</th><th></th></tr></thead><tbody>${hist.map((h) => `<tr><td>${esc(new Date(h.data).toLocaleString('pt-BR'))}</td><td>${esc(h.arquivo || '')}</td><td>${esc(h.usuario || '')}</td><td class="num">${u.inteiro(h.novos.length + (h.controleNovos || []).length)}</td><td class="num">${u.inteiro(h.alterados.length + (h.controleAlterados || []).length)}</td><td>${h.desfeitoEm ? `Desfeita em ${u.data(h.desfeitoEm.slice(0, 10))}` : pode() ? `<button class="botao pequeno" data-imp-desfazer="${esc(h.id)}">Desfazer</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="vazio">Nenhuma ainda.</p>'}</section>`,
      ligar() {
        const re = () => VP.app.render();
        document.querySelector('[data-modelo-imp]').addEventListener('click', P.baixarModelo);
        document.querySelector('[data-imp-arquivo]')?.addEventListener('change', async (e) => {
          const arq = e.target.files[0]; e.target.value = '';
          if (!arq) return;
          try { await P.lerArquivo(arq); } catch (err) { return ui.aviso(err.message, 'erro'); }
          if (!st().abas.some((a) => a.linhas.length)) { st().abas = null; return ui.aviso('A planilha está vazia.', 'erro'); }
          re();
        });
        document.querySelectorAll('[data-imp-usar]').forEach((el) => el.addEventListener('change', () => { s.abas[el.dataset.impUsar].usar = el.checked; }));
        document.querySelectorAll('[data-imp-cj]').forEach((el) => el.addEventListener('change', () => { const a = s.abas[el.dataset.impCj]; a.cj = el.value; a.mapa = a.cab.map((t) => sugerir(t, a.cj)); re(); }));
        document.querySelectorAll('[data-imp-mapa]').forEach((el) => el.addEventListener('change', () => { const [ai, ci] = el.dataset.impMapa.split(':').map(Number); s.abas[ai].mapa[ci] = el.value; }));
        document.querySelector('[data-imp-previa]')?.addEventListener('click', () => {
          if (!s.abas.some((a) => a.usar)) return ui.aviso('Marque pelo menos uma aba.', 'erro');
          if (document.querySelector('[data-imp-salvar-mapa]')?.checked) {
            const modelos = ui.pref.ler('depara-bens', {});
            for (const a of s.abas.filter((x) => x.usar)) modelos[a.cj] = Object.assign(modelos[a.cj] || {}, Object.fromEntries(a.cab.map((t, i) => [norm(t), a.mapa[i]])));
            ui.pref.gravar('depara-bens', modelos);
          }
          P.gerarPrevia(); re();
        });
        document.querySelectorAll('[data-imp-descartar]').forEach((b) => b.addEventListener('click', () => { s.abas = null; s.previa = null; re(); }));
        document.querySelectorAll('[data-imp-item]').forEach((el) => el.addEventListener('change', () => { s.previa.itens[el.dataset.impItem].marcado = el.checked; }));
        document.querySelectorAll('[data-imp-marcar]').forEach((b) => b.addEventListener('click', () => { const v = b.dataset.impMarcar === '1'; s.previa.itens.forEach((x) => { if (x.classe === 'novo' || x.classe === 'alterado') x.marcado = v; }); document.querySelectorAll('[data-imp-item]').forEach((i) => { i.checked = v; }); }));
        document.querySelector('[data-imp-filtro]')?.addEventListener('change', (e) => document.querySelectorAll('#tab-previa-imp tbody tr').forEach((tr) => { tr.hidden = !!e.target.value && tr.dataset.classe !== e.target.value; }));
        document.querySelector('[data-imp-aplicar]')?.addEventListener('click', async (e) => {
          const n = s.previa.itens.filter((x) => x.marcado && (x.classe === 'novo' || x.classe === 'alterado')).length;
          if (!n) return ui.aviso('Nada marcado para importar.', 'erro');
          if (!await ui.confirmar(`Importar ${u.inteiro(n)} linha(s) marcada(s)?`, { titulo: 'Importar', sim: 'Importar' })) return;
          e.target.disabled = true;
          try { await P.aplicar(); } catch (err) { ui.aviso('Não foi possível gravar: ' + err.message, 'erro'); }
          re();
        });
        document.querySelectorAll('[data-imp-desfazer]').forEach((b) => b.addEventListener('click', async () => {
          const reg = VP.db.pega('importacoesPlanilha', b.dataset.impDesfazer);
          if (!await ui.confirmar(`Desfazer a importação de ${esc(reg.arquivo)}? Os bens incluídos vão para a Lixeira e os alterados voltam ao valor anterior.`, { titulo: 'Desfazer importação', sim: 'Desfazer', classe: 'perigo' })) return;
          await P.desfazer(reg); re();
        }));
      }
    };
  };
})();
