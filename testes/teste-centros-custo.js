// Importar NOMES de centros de custo (arquivo FICTÍCIO no formato do relatório de usuários × centros de custo).
// Confere: só código e nome entram; nomes e matrículas de servidores (fictícios) NÃO ficam gravados em lugar nenhum.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/planilhas-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
// arquivo fictício: ; entre colunas, aspas, acentos do Windows (latin-1), uma linha por servidor × centro
const L = ['"Usuário - Código";"Usuário - Único";"Usuário - Nome";"Centro de Custo - Código";"Classificação";"Descrição";"Principal"'];
const lin = (mat, nome, cc, cl, desc, pr) => L.push([mat, mat, nome, cc, cl, desc, pr].map((x) => `"${x}"`).join(';'));
lin('99901', 'SERVIDOR FICTÍCIO UM', '501', '91.001.001', 'SECRETARIA EXEMPLO DE EDUCAÇÃO', 'Sim');
lin('99902', 'SERVIDOR FICTÍCIO DOIS', '501', '91.001.001', 'SECRETARIA EXEMPLO DE EDUCAÇÃO', 'Não');
lin('99903', 'SERVIDOR FICTÍCIO TRÊS', '501', '91.001.001', 'SECRETARIA EXEMPLO DE EDUCAÇÃO', 'Não');
lin('99901', 'SERVIDOR FICTÍCIO UM', '777', '91.009.001', 'ALMOXARIFADO EXEMPLO', 'Não');
lin('99904', 'SERVIDOR FICTÍCIO QUATRO', '778', '91.009.002', 'POSTO EXEMPLO NORTE', 'Sim');
lin('99905', 'SERVIDOR FICTÍCIO CINCO', '778', '91.009.002', 'POSTO EXEMPLO SUL', 'Sim');
fs.writeFileSync('/tmp/centros-custo-ficticio.csv', Buffer.from(L.join('\r\n') + '\r\n', 'latin1'));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  // unidade criada antes pela importação de bens (nome provisório) e uma unidade do exemplo com outro nome
  const ex = await J(async () => {
    await VP.db.gravar('unidades', { id: 'UCC1', codigo: '91.001.001', nome: 'Centro de custo 91.001.001', criadaPorImportacao: true });
    return { n: VP.db.lista('unidades').length };
  });
  await ir('planilhas/importar');
  await p.setInputFiles('[data-imp-arquivo]', '/tmp/centros-custo-ficticio.csv'); await p.waitForSelector('#depara-imp');
  const a = await J(() => { const a = VP.estado.impBens.abas[0]; return { cj: a.cj, cab: a.cab, mapa: a.mapa }; });
  console.log('   ligações:', JSON.stringify(a.cab.map((t, i) => `${t}→${a.mapa[i] || '-'}`)));
  ok(a.cj === 'unidades', 'arquivo reconhecido sozinho como "Unidades / centros de custo"');
  ok(a.mapa.filter(Boolean).join() === 'codigo,nome' && a.mapa[4] === 'codigo' && a.mapa[5] === 'nome', 'só 2 colunas ligadas: Classificação → código, Descrição → nome (servidores ficam de fora)');
  await p.screenshot({ path: O + '/cc-depara.png', fullPage: true });
  await p.click('[data-imp-previa]'); await p.waitForSelector('#previa-imp');
  const pv = await J(() => VP.estado.impBens.previa.itens.map((x) => `${x.plaqueta}:${x.classe}`));
  console.log('   prévia:', JSON.stringify(pv));
  ok(pv.join() === '91.001.001:alterado,91.009.001:novo,91.009.002:erro', 'prévia: renomear o provisório, unidade nova, conflito (mesmo código com 2 nomes)');
  const txt = await p.textContent('#previa-imp');
  ok(/Centro de custo 91\.001\.001 → SECRETARIA EXEMPLO DE EDUCAÇÃO/.test(txt) && /Conflito/.test(txt) && /3 linhas/.test(txt), 'prévia mostra antes → depois, o conflito e as linhas juntadas');
  ok(!/SERVIDOR FICT/.test(txt), 'nomes de servidores não aparecem na prévia');
  await p.screenshot({ path: O + '/cc-previa.png', fullPage: true });
  await p.click('[data-imp-aplicar]'); await p.waitForSelector(dlg); await botaoDlg('Importar'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const res = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  await botaoDlg('Fechar');
  const g = await J(() => ({ u1: VP.db.pega('unidades', 'UCC1'), nova: VP.db.lista('unidades').find((x) => x.codigo === '91.009.001'), conf: VP.db.lista('unidades').filter((x) => x.codigo === '91.009.002').length }));
  ok(/Deram certo ?2/.test(res) && /Não foram feitos ?1/.test(res), 'resultado: 2 feitos, 1 não (conflito)');
  ok(g.u1.nome === 'SECRETARIA EXEMPLO DE EDUCAÇÃO' && g.u1.historicoNomes?.[0]?.nome === 'Centro de custo 91.001.001', 'renomeada; nome anterior no histórico da unidade');
  ok(g.nova?.nome === 'ALMOXARIFADO EXEMPLO' && g.conf === 0, 'unidade nova criada; o conflito não entrou');
  // nada de servidor gravado
  const vaz = await J(() => { const t = JSON.stringify(VP.COLECOES.map((c) => VP.db.lista(c, true))); return { nome: /SERVIDOR FICT/.test(t), mat: /9990[1-5]/.test(t) }; });
  const idb = await J(() => new Promise((ok) => { const r = indexedDB.open('vitalpat-patrimonio-gestao', 1); r.onsuccess = () => { const q = r.result.transaction('docs').objectStore('docs').getAll(); q.onsuccess = () => ok(JSON.stringify(q.result)); }; }));
  ok(!vaz.nome && !vaz.mat && !/SERVIDOR FICT|9990[1-5]/.test(idb), 'nenhum nome nem matrícula de servidor gravado (memória e banco do navegador)');
  // desfazer
  await ir('planilhas/importar');
  await p.click('[data-imp-desfazer]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar');
  const dz = await J(() => ({ u1: VP.db.pega('unidades', 'UCC1').nome, nova: VP.db.lista('unidades', true).find((x) => x.codigo === '91.009.001') }));
  ok(dz.u1 === 'Centro de custo 91.001.001' && dz.nova.excluido === true, 'desfazer: nome anterior volta e a unidade nova vai para a Lixeira');
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
