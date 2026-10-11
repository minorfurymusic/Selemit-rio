const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = process.argv[2] + '/cem-prints';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  console.log('URL', p.url());
  const id = await p.evaluate(() => VP.db.lista('tumulos')[5].id);
  for (const h of ['painel', 'mapa', 'tumulos', 'tumulo/' + id, 'importar', 'levantamento', 'relatorios', 'relatorio/ocupacao', 'relatorio/etiquetas', 'cadastros', 'cadastros/cemiterios', 'configuracoes', 'lixeira']) {
    await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(400);
    const t = await p.textContent('#titulo-tela');
    console.log(h, '→', t);
    await p.screenshot({ path: `${O}/${h.replace(/\W/g, '_')}.png`, fullPage: false });
  }
  console.log('ERROS', erros.length, erros.slice(0, 10));
  await b.close();
})();
