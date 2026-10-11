// Prévia da importação com páginas e filtros; "Salvar os marcados desta página" e "Salvar todos". Relatório FICTÍCIO com 650 bens.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
execSync(`python3 ${__dirname}/gera-relatorio.py /tmp/relatorio-650.csv 650`);
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' })).newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  const J = (f, a) => p.evaluate(f, a);
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const antes = await J(() => VP.db.lista('bens').length);
  await J(() => { location.hash = 'planilhas/importar'; }); await p.waitForTimeout(500);
  await p.setInputFiles('[data-imp-arquivo]', '/tmp/relatorio-650.csv'); await p.waitForSelector('#depara-imp');
  await p.click('[data-imp-previa]'); await p.waitForSelector('#previa-imp');
  const linhas = async () => (await p.$$('#tab-previa-imp tbody tr')).length;
  ok(await linhas() === 300 && (await p.textContent('.paginador')).includes('de 3'), 'página 1 de 3, com 300 linhas');
  await p.click('.paginador [data-imp-pag="1"]'); await p.waitForTimeout(300);
  const t2 = await p.textContent('#tab-previa-imp tbody tr:first-child');
  ok(await linhas() === 300 && /, 306/.test(t2), 'Próxima: página 2 começa na linha 306 do arquivo (300 depois da primeira, que é a 6)');
  await p.selectOption('[data-imp-ir-pag] >> nth=0', { value: '2' }); await p.waitForTimeout(300);
  const l3 = await linhas(); ok(l3 === 51, 'página 3: as 51 linhas que sobram: ' + l3 + ' · ' + (await p.textContent('.paginador')).replace(/\s+/g, ' '));
  await p.selectOption('[data-imp-por-pag]', '100'); await p.waitForTimeout(300);
  ok(await linhas() === 100 && (await p.textContent('.paginador')).includes('de 7'), '100 por página: 7 páginas');
  await p.selectOption('[data-imp-filtro-cc]', '91.001.001'); await p.waitForTimeout(300);
  const nCC = await J(() => VP.estado.impBens.previa.itens.filter((x) => x.valores.unidadeId === '__nova:91.001.001').length);
  ok(await linhas() === Math.min(100, nCC) && (await p.textContent('#previa-imp')).includes(`${nCC.toLocaleString('pt-BR')} linha(s) neste filtro`), `filtro por centro de custo 91.001.001: ${nCC} linhas`);
  // salva só a página na tela
  const naPag = await J(() => VP.planilhas.itensDaPagina().filter((x) => x.marcado && x.classe === 'novo').length);
  await p.click('[data-imp-aplicar-pag]'); await p.waitForSelector(dlg); await botaoDlg('Salvar'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const r1 = (await p.textContent(dlg)).replace(/\s+/g, ' '); await botaoDlg('Fechar'); await p.waitForTimeout(400);
  const d1 = await J(() => ({ bens: VP.db.lista('bens').length, previa: !!VP.estado.impBens.previa, grav: VP.estado.impBens.previa?.itens.filter((x) => x.classe === 'gravado').length }));
  ok(new RegExp(`Deram certo ?${naPag}`).test(r1) && d1.bens - antes === naPag && d1.previa && d1.grav === naPag, `salvar esta página: só ${naPag} gravados; a prévia continua com o resto ("Já gravado")`);
  // salva todos os que faltam
  await p.click('[data-imp-aplicar]'); await p.waitForSelector(dlg); await botaoDlg('Importar'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar'); await p.waitForTimeout(400);
  const d2 = await J(() => ({ bens: VP.db.lista('bens').length, previa: !!VP.estado.impBens.previa, plaq: (() => { const pl = VP.db.lista('bens', true).map((b) => b.plaqueta); return pl.length - new Set(pl).size; })() }));
  ok(d2.bens - antes === 650 && !d2.previa, 'salvar todos: os 650 válidos gravados no total (a linha com plaqueta repetida no arquivo fica de fora); prévia fechada: ' + (d2.bens - antes));
  ok(d2.plaq === 0, 'nenhuma plaqueta repetida no sistema');
  // plaqueta automática não repete as importadas
  const novo = await J(async () => (await VP.criarBens({ descricao: 'Novo (teste)', classificacaoId: VP.db.lista('bens')[0].classificacaoId, unidadeId: VP.db.lista('unidades')[0].id, valor: 5 }))[0].plaqueta);
  ok(novo === '90650', 'bem novo depois da importação recebe a próxima plaqueta livre (90650), sem repetir: ' + novo);
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
