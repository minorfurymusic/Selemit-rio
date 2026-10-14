// Com servidor (banco local, sistema VAZIO como numa cidade nova): importar patrimonio/modelos-importacao/dados-de-teste.xlsx
// cria 1 de cada cadastro + compra + bens; pendências de cadastro vazio somem; importar de novo = tudo "Igual"; desfazer volta tudo.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const simular = require('./simulador-supabase.js');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const sql = (q) => execSync(`psql -h /tmp/vitalpat-pg -p 5499 -U postgres -d s_unico -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim();
const ativos = (col) => +sql(`select count(*) from patrimonio.docs where colecao='${col}' and coalesce(dados->>'excluido','false')<>'true'`);
const BANCOS = { patrimonio: { url: 'https://pat-teste.supabase.co', porta: 3001, pessoas: { 'bia@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000b1', senha: 'segredo123' } } } };
const ARQ = path.join(__dirname, '..', 'patrimonio', 'modelos-importacao', 'dados-de-teste.xlsx');
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', serviceWorkers: 'block' });
  await simular(ctx, BANCOS);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.message); });
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'bia@ex.gov.br'); await p.fill('#senha', 'segredo123'); await p.click('#entrar');
  await p.waitForURL('**/patrimonio/gestao/**'); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const cadVazios = () => p.evaluate(() => VP.pendencias().filter((x) => x.chave.startsWith('cadastro-')).map((x) => x.chave));
  ok((await cadVazios()).length === 5, 'sistema vazio: 5 pendências de cadastro vazio: ' + (await cadVazios()).join(', '));

  const bytes = [...fs.readFileSync(ARQ)];
  const importar = () => p.evaluate(async (by) => {
    await VP.planilhas.lerArquivo(new File([new Uint8Array(by)], 'dados-de-teste.xlsx'));
    const pv = VP.planilhas.gerarPrevia();
    const conta = {}; for (const x of pv.itens) { const k = `${x.tabela || x.cj}:${x.classe}`; conta[k] = (conta[k] || 0) + 1; }
    return { conta, erros: pv.itens.filter((x) => x.classe === 'erro').map((x) => `${x.aba} ${x.linha}: ${x.erros.join('; ')}`), abas: VP.estado.impBens.abas.map((a) => `${a.nome}=${a.cj}`) };
  }, bytes);
  const aplicar = () => p.evaluate(async () => { const r = await VP.planilhas.aplicar(); document.querySelectorAll('dialog.janela[open] footer button').forEach((x) => { if (x.textContent.trim() === 'Fechar') x.click(); }); return { ok: r.sucesso.length, falhas: r.falhas.map((f) => f.item + ': ' + f.motivo), reg: r.reg.id }; });

  // 1) prévia: tudo novo, nenhum erro
  const pv = await importar();
  ok(pv.erros.length === 0, 'prévia sem erro: ' + JSON.stringify(pv.erros));
  const esperado = { 'entidades:novo': 1, 'contas:novo': 2, 'responsaveis:novo': 1, 'fornecedores:novo': 1, 'motivos:novo': 1, 'comissoes:novo': 1, 'seguradoras:novo': 1, 'tiposGarantia:novo': 1, 'classificacoes:novo': 4, 'produtos:novo': 1, 'itensIncorporar:novo': 1, 'unidades:novo': 2, 'movel:novo': 1, 'veiculo:novo': 1, 'imovel:novo': 1, 'controle:novo': 1 };
  ok(JSON.stringify(Object.entries(pv.conta).sort()) === JSON.stringify(Object.entries(esperado).sort()), 'prévia com 1 de cada coisa (todos novos): ' + JSON.stringify(pv.conta));

  // 2) gravar
  const r1 = await aplicar();
  ok(r1.falhas.length === 0, 'gravou sem falha: ' + JSON.stringify(r1.falhas));
  const cont = Object.fromEntries(['entidades', 'contas', 'responsaveis', 'fornecedores', 'motivos', 'comissoes', 'seguradoras', 'tiposGarantia', 'classificacoes', 'produtos', 'itensIncorporar', 'unidades', 'bens', 'bensControle'].map((c) => [c, ativos(c)]));
  ok(JSON.stringify(cont) === JSON.stringify({ entidades: 1, contas: 2, responsaveis: 1, fornecedores: 2, motivos: 1, comissoes: 1, seguradoras: 1, tiposGarantia: 1, classificacoes: 4, produtos: 1, itensIncorporar: 1, unidades: 2, bens: 3, bensControle: 1 }), 'no banco: ' + JSON.stringify(cont) + ' (2 fornecedores: o da aba e o novo da compra)');
  const lig = await p.evaluate(() => {
    const bem = VP.db.lista('bens').find((x) => x.descricao === 'TESTE Cadeira');
    const compra = VP.db.lista('itensIncorporar')[0];
    const cl = VP.db.pega('classificacoes', bem.classificacaoId);
    return { unidade: VP.nome('unidades', bem.unidadeId), resp: VP.nome('responsaveis', bem.responsavelId), forn: VP.nome('fornecedores', bem.fornecedorId), classe: VP.caminhoClassificacao(cl), conta: VP.nome('contas', VP.dadosDaClassificacao(cl.id).contaId), residual: `${bem.depreciacao.residualTipo}:${bem.depreciacao.residual}`,
      compraForn: VP.db.pega('fornecedores', compra.fornecedorId), compraEnt: VP.nome('entidades', compra.entidadeId), compraProd: VP.nome('produtos', compra.produtoId), compraOc: compra.ordemCompra, controleUn: VP.nome('unidades', VP.db.lista('bensControle')[0].unidadeId) };
  });
  ok(lig.unidade === 'T01 · TESTE Unidade 01' && lig.resp === 'TESTE Responsável' && lig.forn === 'TESTE Fornecedor Ltda' && lig.controleUn === 'T01 · TESTE Unidade 01', 'bem e item de controle ligados aos cadastros novos da mesma planilha');
  ok(lig.classe === 'TESTE Bens móveis › TESTE Mobiliário' && lig.conta === '1.2.3.1.1.01.99 · TESTE Bens móveis' && lig.residual === 'percentual:10', 'classificação dentro do grupo, conta e residual 10% vindos da planilha: ' + JSON.stringify([lig.classe, lig.conta, lig.residual]));
  ok(lig.compraForn?.nome === 'TESTE Fornecedor Novo da Compra' && lig.compraForn?.documento === '22.222.222/0001-22' && lig.compraForn?.criadoPelaCompra && lig.compraEnt === 'TESTE Prefeitura Municipal' && lig.compraProd === 'TESTE Cadeira' && lig.compraOc?.numero === '1', 'compra: fornecedor novo cadastrado sozinho (com CNPJ), entidade, produto e ordem de compra');
  ok((await cadVazios()).length === 0, 'pendências de cadastro vazio sumiram');

  // 3) importar de novo: nada duplica
  const pv2 = await importar();
  const n2 = Object.entries(pv2.conta).filter(([k]) => !/:igual$/.test(k));
  ok(n2.length === 1 && n2[0][0] === 'controle:novo', 'importar de novo: cadastros, compra e bens (pela plaqueta) "Igual"; só o item de controle entra de novo (item novo não leva código, regra de antes): ' + JSON.stringify(pv2.conta));
  await p.evaluate(() => { VP.estado.impBens.abas = null; VP.estado.impBens.previa = null; });

  // 4) exportar os cadastros e importar de volta: tudo igual
  const rt = await p.evaluate(async () => {
    const blob = VP.gravarXLSX(VP.importaCadastros.abasExportar());
    await VP.planilhas.lerArquivo(new File([blob], 'cadastros.xlsx'));
    const pv = VP.planilhas.gerarPrevia(); VP.estado.impBens.abas = null; VP.estado.impBens.previa = null;
    return pv.itens.map((x) => x.classe);
  });
  ok(rt.length === 18 && rt.every((x) => x === 'igual'), `exportar cadastros e importar de volta: ${rt.length} registros, todos "Igual"`);

  // 5) desfazer a importação
  const d = await p.evaluate(async (id) => { await VP.planilhas.desfazer(VP.db.pega('importacoesPlanilha', id)); document.querySelectorAll('dialog.janela[open] footer button').forEach((x) => { if (x.textContent.trim() === 'Fechar') x.click(); }); }, r1.reg);
  const cont2 = Object.fromEntries(['entidades', 'contas', 'responsaveis', 'fornecedores', 'classificacoes', 'produtos', 'itensIncorporar', 'unidades', 'bens'].map((c) => [c, ativos(c)]));
  ok(Object.values(cont2).every((n) => n === 0), 'desfazer: tudo foi para a Lixeira (nada apagado): ' + JSON.stringify(cont2));
  ok(+sql("select count(*) from patrimonio.docs where colecao='classificacoes'") === 4, 'classificações continuam no banco, marcadas como excluídas');

  ok(erros.length === 0, 'sem erros na página: ' + JSON.stringify(erros));
  console.log(falhas ? `FALHARAM ${falhas}` : 'TUDO PASSOU (banco e regras reais em PostgreSQL+PostgREST locais; login simulado)');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
