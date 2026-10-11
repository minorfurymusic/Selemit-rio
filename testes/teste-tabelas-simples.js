// Listas simples (sem barra) ganham "Baixar planilha" em Excel.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(700); };
  const dlg = 'dialog.janela[open]';
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  // reavaliação: gera um bloco para existir a lista "Blocos já reavaliados"? usa as telas que já têm lista simples nos dados de exemplo
  for (const h of ['manutencao', 'inventario', 'financeiro/fechamento', 'frota/cartao', 'planilhas/importar']) {
    await ir(h);
    const n = await J(() => document.querySelectorAll('#conteudo [data-planilha-simples]').length);
    const simples = await J(() => [...document.querySelectorAll('#conteudo table.tabela')].filter((t) => !(t.closest('.tabela-rolagem') || t).previousElementSibling?.classList.contains('tabela-barra')).length);
    console.log(`   #${h}: ${n} botão(ões) novos; tabelas sem botão: ${simples}`);
    ok(simples === 0, `#${h}: toda lista tem "Baixar planilha"`);
  }
  await ir('manutencao');
  if (await p.$('[data-planilha-simples]')) {
    await p.click('[data-planilha-simples]'); await p.waitForSelector(dlg);
    const [d] = await Promise.all([p.waitForEvent('download'), p.click(`${dlg} footer button:has-text("Baixar")`)]);
    const f = '/tmp/simples-' + d.suggestedFilename(); await d.saveAs(f);
    const r = execSync(`python3 -c "import openpyxl,sys; ws=openpyxl.load_workbook(sys.argv[1]).worksheets[0]; print(ws.max_row>1, type(ws.cell(2,2).value).__name__)" ${f}`).toString().trim();
    ok(f.endsWith('.xlsx') && r.startsWith('True'), 'lista de custo da manutenção baixada em Excel: ' + d.suggestedFilename() + ' ' + r);
  }
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
