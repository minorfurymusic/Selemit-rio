const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let falhas = 0; const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch(); const erros = [];
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  for (const k of ['patrimonio', 'cemiterio']) await ctx.route(`**/${k}/config-servidor.js`, (r) => r.fulfill({ contentType: 'text/javascript', body: `window.VP_SERVIDOR_${k.toUpperCase()} = { url: '', chavePublica: '', municipio: '' };` }));
  const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const dlg = 'dialog.janela[open]';
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  const pend = await p.evaluate(() => VP.mesesPendentes(VP.Plataforma.hoje().slice(0, 7)));
  console.log('   meses pendentes:', pend);
  // modo manual: balancete não lança nada
  const f0 = await p.evaluate(() => VP.db.lista('fechamentos').length);
  await p.evaluate(() => { location.hash = 'relatorio/balancete'; }); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => VP.db.lista('fechamentos').length) === f0, 'modo manual: abrir o balancete não fecha nada');
  // liga "ao gerar o balancete"
  await p.evaluate(() => { location.hash = 'configuracoes'; }); await p.waitForTimeout(500);
  await p.selectOption('#form-cfg [name=depreciacaoAutomatica]', 'balancete'); await p.click('[data-salvar-cfg]'); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = 'relatorio/balancete'; }); await p.waitForSelector(dlg, { timeout: 10000 });
  const txt = await p.textContent(dlg);
  console.log('   ', txt.replace(/\s+/g, ' ').slice(0, 160));
  ok(txt.includes('Depreciação lançada automaticamente') && await p.evaluate(() => VP.mesesPendentes(VP.Plataforma.hoje().slice(0, 7)).length) === 0, `ao gerar o balancete: lançou ${pend.length} mês(es) pendente(s)`);
  await p.click(`${dlg} footer button:has-text("Fechar")`);
  ok((await p.textContent('.nota-relatorio')).includes('✓'), 'balancete continua fechando (saldo anterior + entradas − saídas − depreciação = saldo final)');
  await p.evaluate(() => { location.hash = 'painel'; }); await p.waitForTimeout(300); await p.evaluate(() => { location.hash = 'relatorio/balancete'; }); await p.waitForTimeout(1000);
  ok(!(await p.$(dlg)), 'sem meses pendentes: não lança de novo');
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
