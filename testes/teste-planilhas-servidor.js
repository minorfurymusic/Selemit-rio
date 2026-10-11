// Com servidor (banco local com as regras reais): importação de bens por planilha, anexos em lote e itens de controle gravam no banco
// e no armazenamento; o papel "consulta" não importa.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
const simular = require('./simulador-supabase.js');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const sql = (q) => execSync(`psql -h /tmp/vitalpat-pg -p 5499 -U postgres -d s_unico -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim();
const BANCOS = { patrimonio: { url: 'https://pat-teste.supabase.co', porta: 3001, pessoas: {
  'bia@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000b1', senha: 'segredo123' },
  'caio@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000c1', senha: 'segredo123' } } } };
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const nova = async () => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', serviceWorkers: 'block' }); const est = await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); }); p.est = est; return p; };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); await p.waitForURL('**/patrimonio/gestao/**'); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 }); };
  let p = await nova();
  await entrar(p, 'bia@ex.gov.br');
  await p.evaluate(async () => {
    await VP.db.gravarVarias({ unidades: [{ id: 'U1', codigo: '01', nome: 'Escola Teste' }], classificacoes: [{ id: 'G1', codigo: '1', nome: 'Mobiliário', nivel: 'grupo', paiId: '', tipoBem: 'movel', vidaUtilMeses: 120 }, { id: 'C1', codigo: '2', nome: 'Cadeiras', nivel: 'classe', paiId: 'G1' }] });
    const { bens, eventos } = VP.montarBens({ descricao: 'Mesa antiga', classificacaoId: 'C1', unidadeId: 'U1', dataAquisicao: '2020-01-10', valor: 300, quantidade: 1, plaqueta: '5000' });
    await VP.db.gravarVarias({ bens, eventos });
  });
  // importação por planilha (mesmas funções da tela)
  const r = await p.evaluate(async () => {
    const blob = VP.gravarXLSX([{ nome: 'Bens móveis', cabecalho: ['Plaqueta', 'Descrição', 'Classificação', 'Unidade', 'Data de aquisição', 'Valor de aquisição', 'Local na unidade'], linhas: [['', 'Cadeira nova', 'Mobiliário › Cadeiras', 'Escola Teste', '01/02/2024', 199.9, ''], ['5000', '', '', '', '', '', 'Sala 7']] }, { nome: 'Itens de controle', cabecalho: ['Descrição', 'Quantidade', 'Valor unitário', 'Unidade'], linhas: [['Grampeador', 3, 20, 'Escola Teste']] }]);
    await VP.planilhas.lerArquivo(new File([blob], 'teste.xlsx'));
    const pv = VP.planilhas.gerarPrevia();
    const res = await VP.planilhas.aplicar();
    document.querySelectorAll('dialog.janela[open] footer button').forEach((x) => { if (x.textContent.trim() === 'Fechar') x.click(); });
    return { classes: pv.itens.map((i) => i.classe), ok: res.sucesso.length, falhas: res.falhas.length };
  });
  ok(r.classes.join() === 'novo,alterado,novo' && r.ok === 3, 'importação com servidor: prévia novo/alterado/item de controle e 3 gravados: ' + JSON.stringify(r));
  ok(sql("select count(*) from patrimonio.docs where colecao='bens' and dados->>'descricao'='Cadeira nova'") === '1' && sql("select dados->>'localizacao' from patrimonio.docs where colecao='bens' and dados->>'plaqueta'='5000'") === 'Sala 7', 'bens novo e alterado gravados no banco');
  ok(sql("select count(*) from patrimonio.docs where colecao='bensControle'") === '1' && sql("select count(*) from patrimonio.docs where colecao='importacoesPlanilha'") === '1', 'item de controle e registro da importação no banco');
  ok(+sql("select count(*) from patrimonio.historico where colecao='bens' and id=(select id from patrimonio.docs where colecao='bens' and dados->>'plaqueta'='5000')") >= 2, 'valor anterior guardado no histórico do banco');
  // anexos em lote
  const a = await p.evaluate(async () => {
    const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
    const it = VP.anexos.gerarPrevia([new File([png], '5000_mesa_antiga_01.png', { type: 'image/png' }), new File([png], '7777_nao_existe_01.png', { type: 'image/png' })]);
    const res = await VP.anexos.aplicar();
    document.querySelectorAll('dialog.janela[open] footer button').forEach((x) => { if (x.textContent.trim() === 'Fechar') x.click(); });
    const bem = VP.db.lista('bens').find((x) => x.plaqueta === '5000');
    return { classes: it.map((x) => x.classe), ok: res.sucesso.length, id: bem.id, an: bem.anexos[0]?.id };
  });
  ok(a.classes.join() === 'ok,erro' && a.ok === 1, 'anexos em lote com servidor: 1 anexado, 1 sem bem');
  const an = JSON.parse(sql(`select dados->'anexos'->0 from patrimonio.docs where colecao='bens' and id='${a.id}'`));
  ok(an.caminho === `bens/${a.id}/${a.an}.jpg` && !('dataURL' in an) && p.est.arquivos[an.caminho] > 0 && an.tipoAnexo === 'Foto', 'anexo no armazenamento (foto reduzida vira .jpg); banco guarda só o caminho e o tipo');
  await p.click('#sair'); await p.waitForURL(/motivo=saiu/);
  // consulta
  p = await nova();
  await entrar(p, 'caio@ex.gov.br');
  await p.evaluate((x) => { location.hash = x; }, 'planilhas/importar'); await p.waitForTimeout(500);
  ok(!(await p.$('[data-imp-arquivo]')) && (await p.textContent('#conteudo')).includes('só de consulta'), 'consulta: tela de importar sem o botão de arquivo');
  await p.evaluate(async () => { await VP.db.gravar('bensControle', { id: 'X1', codigo: 'C-9', descricao: 'tentativa' }).catch(() => {}); });
  await p.waitForTimeout(800);
  ok(sql("select count(*) from patrimonio.docs where colecao='bensControle'") === '1', 'consulta: banco recusa gravar item de controle');
  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros.slice(0, 4)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU (banco e regras reais em PostgreSQL+PostgREST locais; login e fotos simulados)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
