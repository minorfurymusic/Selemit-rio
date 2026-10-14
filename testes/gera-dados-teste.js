// Gera patrimonio/modelos-importacao/dados-de-teste.xlsx: 1 de cada coisa (dados FICTÍCIOS, nomes "TESTE"), para importar
// num sistema vazio e testar tudo. Usa o próprio sistema (modo demonstração) para montar as colunas certas.
// Uso: testes/copia.sh && node testes/gera-dados-teste.js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DESTINO = path.join(__dirname, '..', 'patrimonio', 'modelos-importacao', 'dados-de-teste.xlsx');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ acceptDownloads: true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => {
    const P = VP.planilhas, C = VP.importaCadastros;
    const aba = (t, linhas) => ({ nome: C.DEF[t].aba, cabecalho: C.DEF[t].campos.map((c) => c.t), linhas: linhas.map((l) => C.DEF[t].campos.map((c) => l[c.k] ?? '')) });
    const abaBens = (cj, nome, linhas) => { const cs = P.camposDe(cj).filter((c) => !c.naoModelo); return { nome, cabecalho: cs.map((c) => c.t), linhas: linhas.map((l) => cs.map((c) => l[c.k] ?? '')) }; };
    const unid = 'TESTE Unidade 01', resp = 'TESTE Responsável', forn = 'TESTE Fornecedor Ltda';
    const abas = [
      { nome: 'Unidades', cabecalho: ['Código', 'Nome'], linhas: [['T01', unid], ['T02', 'TESTE Unidade 02']] },
      aba('entidades', [{ nome: 'TESTE Prefeitura Municipal', documento: '00.000.000/0001-91' }]),
      aba('contas', [{ codigo: '1.2.3.1.1.01.99', nome: 'TESTE Bens móveis', tipo: 'Ativo (bens)' }, { codigo: '1.2.3.8.1.01.99', nome: 'TESTE Depreciação acumulada', tipo: 'Depreciação acumulada' }]),
      aba('responsaveis', [{ nome: resp, matricula: 'T-0001', cargo: 'TESTE Cargo', documento: '000.000.000-00', email: 'teste@exemplo.gov.br' }]),
      aba('fornecedores', [{ nome: forn, documento: '11.111.111/0001-11', contato: '(00) 0000-0000' }]),
      aba('motivos', [{ tipo: 'Baixa', nome: 'TESTE Motivo de baixa' }]),
      aba('comissoes', [{ nome: 'TESTE Comissão de inventário', ato: 'Portaria TESTE 1/2026', membros: 'TESTE Membro 1; TESTE Membro 2; TESTE Membro 3' }]),
      aba('seguradoras', [{ nome: 'TESTE Seguradora', corretora: 'Não' }]),
      aba('tiposGarantia', [{ nome: 'TESTE Garantia do fabricante' }]),
      aba('classificacoes', [
        { nome: 'TESTE Bens móveis', codigo: 'T1', tipoBem: 'Bem móvel', contaId: '1.2.3.1.1.01.99', contaDepreciacaoId: '1.2.3.8.1.01.99', vidaUtilMeses: 120, residualPct: 10, naoDeprecia: 'Não' },
        { nome: 'TESTE Mobiliário', codigo: 'T1.1', paiId: 'TESTE Bens móveis', vidaUtilMeses: 120, residualPct: 10, naoDeprecia: 'Não' },
        { nome: 'TESTE Veículos', codigo: 'T2', tipoBem: 'Veículo', contaId: '1.2.3.1.1.01.99', contaDepreciacaoId: '1.2.3.8.1.01.99', vidaUtilMeses: 60, residualPct: 20, naoDeprecia: 'Não' },
        { nome: 'TESTE Imóveis', codigo: 'T3', tipoBem: 'Bem imóvel', contaId: '1.2.3.1.1.01.99', contaDepreciacaoId: '1.2.3.8.1.01.99', vidaUtilMeses: 600, residualPct: 10, naoDeprecia: 'Não' }]),
      aba('produtos', [{ codigo: 'P1', nome: 'TESTE Cadeira', classificacaoId: 'TESTE Bens móveis › TESTE Mobiliário' }]),
      aba('itensIncorporar', [{ entidadeId: 'TESTE Prefeitura Municipal', oc: '1/2026', empenho: '', emissao: '', fornecedorId: 'TESTE Fornecedor Novo da Compra', _cnpjFornecedor: '22.222.222/0001-22', produtoId: 'TESTE Cadeira', quantidade: 2, valorUnitario: 450, liquidado: 'Não' }]),
      abaBens('movel', 'Bens móveis', [{ plaqueta: 'TESTE-0001', descricao: 'TESTE Cadeira', classificacaoId: 'TESTE Bens móveis › TESTE Mobiliário', unidadeId: unid, localizacao: 'Sala 1', responsavelId: resp, dataAquisicao: '10/01/2026', valor: 450, estado: 'Novo', situacaoAquisicao: 'Compra', fornecedorId: forn, 'nf.numero': '123', 'detalhes.marca': 'TESTE Marca' }]),
      abaBens('veiculo', 'Veículos', [{ plaqueta: 'TESTE-0002', descricao: 'TESTE Carro', classificacaoId: 'TESTE Veículos', unidadeId: unid, responsavelId: resp, dataAquisicao: '10/01/2026', valor: 80000, estado: 'Novo', situacaoAquisicao: 'Compra', fornecedorId: forn, 'veiculo.placa': 'TST1A23', 'veiculo.combustivel': 'Flex', 'veiculo.anoModelo': '2025/2026' }]),
      abaBens('imovel', 'Imóveis', [{ plaqueta: 'TESTE-0003', descricao: 'TESTE Prédio', classificacaoId: 'TESTE Imóveis', unidadeId: unid, responsavelId: resp, dataAquisicao: '10/01/2020', valor: 500000, estado: 'Bom', situacaoAquisicao: 'Compra', 'imovel.matricula': '00000', 'imovel.situacaoRegistro': 'Registrado', 'imovel.uso': 'Uso especial', 'imovel.afetado': 'Sim', 'endereco.logradouro': 'Rua TESTE, 1', 'endereco.cidade': 'Cidade TESTE' }])
    ];
    const ac = VP.controle.abaModelo();
    abas.push({ nome: ac.nome, cabecalho: ac.cabecalho, linhas: [['', 'TESTE Grampeador', 1, 35, unid, 'Sala 1', resp, '10/01/2026', 1, 'Novo', forn, '', '']] });
    VP.baixarXLSX('dados-de-teste', abas);
  })]);
  fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
  await dl.saveAs(DESTINO);
  console.log('gravado', DESTINO, fs.statSync(DESTINO).size, 'bytes');
  await b.close();
})();
