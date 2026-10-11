const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', acceptDownloads: true });
  await ctx.addInitScript(() => { window.__erros = []; });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
  p.on('console', m => { if (m.type() === 'error') erros.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForURL('**/patrimonio/gestao/**');
  const t0 = Date.now();
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 }).catch(e => erros.push('NAO FICOU PRONTO'));
  console.log('pronto em', Date.now() - t0, 'ms');
  const rotas = ['painel', 'bens', 'novo-bem', 'entradas', 'transferencias', 'inventario', 'financeiro/fechamento', 'financeiro/reavaliacao', 'financeiro/melhorias', 'financeiro/baixas', 'financeiro/contabilidade', 'relatorios', 'historico', 'cadastros/unidades', 'cadastros/classificacoes', 'cadastros/produtos', 'cadastros/tiposMovimentacao', 'configuracoes', 'lixeira', 'unidade/U1',
    'relatorio/balancete', 'relatorio/resumo', 'relatorio/estatistico', 'relatorio/bens', 'relatorio/seguros', 'relatorio/despesas', 'relatorio/incorporacoes', 'relatorio/baixas', 'relatorio/depreciacao', 'relatorio/movfinanceiras', 'relatorio/inventario', 'relatorio/imoveis', 'relatorio/frota', 'relatorio/etiquetas', 'relatorio/termo-responsabilidade', 'relatorio/termo-conferencia', 'relatorio/documentos'];
  const primeiroBem = await p.evaluate(() => VP.db.lista('bens')[0].id);
  rotas.push('bem/' + primeiroBem);
  const veic = await p.evaluate(() => VP.db.lista('bens').find(b => b.tipo === 'veiculo').id); rotas.push('bem/' + veic);
  const imo = await p.evaluate(() => VP.db.lista('bens').find(b => b.tipo === 'imovel').id); rotas.push('bem/' + imo);
  for (const r of rotas) {
    const n = erros.length;
    await p.evaluate((h) => { location.hash = h; }, '#' + r);
    await p.waitForTimeout(250);
    const titulo = await p.textContent('#titulo-tela');
    const falhou = await p.evaluate(() => document.getElementById('conteudo').innerText.includes('Detalhe técnico'));
    console.log((erros.length > n || falhou ? 'ERRO ' : 'ok   ') + r.padEnd(32) + ' | ' + titulo);
    await p.screenshot({ path: `${S}/gestao/${r.replace(/\//g, '_')}.png`, fullPage: true });
  }
  const resumo = await p.evaluate(() => ({ bens: VP.db.lista('bens').length, eventos: VP.db.lista('eventos').length, fech: VP.db.lista('fechamentos').map(f => f.mes + ':' + f.qtd + ':' + f.total), pend: VP.pendencias().map(x => x.titulo + '=' + x.qtd) }));
  console.log(JSON.stringify(resumo, null, 1));
  console.log('ERROS:', JSON.stringify(erros, null, 1));
  await b.close();
})();
