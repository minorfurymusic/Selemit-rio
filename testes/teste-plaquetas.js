// Plaquetas numeradas (000000 a 100000, lotes +N, ligação com prévia e desfazer) — demonstração.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = __dirname + '/cem-prints';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(400); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const erroForm = () => p.textContent(`${dlg} .erro-form`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  await ir('plaquetas');
  ok((await p.textContent('#conteudo')).includes('Próximo número: 000000'), 'começa no 000000');
  await p.click('[data-mais="10"]'); await p.waitForTimeout(500);
  await p.click('[data-mais="50"]'); await p.waitForTimeout(500);
  const g = await J(() => ({ n: VP.plaquetas.todas().length, prox: VP.plaquetas.proximo(), livres: VP.plaquetas.livres().length, primeiro: VP.plaquetas.todas()[0].id, ultimo: VP.plaquetas.todas().at(-1).id }));
  ok(g.n === 60 && g.prox === 60 && g.livres === 60 && g.primeiro === '000000' && g.ultimo === '000059', '+10 e +50 geram 000000 a 000059: ' + JSON.stringify(g));
  const lim = await J(async () => { const c = VP.config(); await VP.salvarConfig(Object.assign({}, c, { limitePlaquetas: 70 })); const r = await VP.plaquetas.gerar(20); await VP.salvarConfig(Object.assign({}, c, { limitePlaquetas: 100000 })); return r.erro || 'gerou'; });
  ok(/limite/.test(lim), 'não passa do limite: ' + lim);
  await ir('plaquetas'); await p.screenshot({ path: O + '/p-plaquetas.png', fullPage: true });

  // ligar uma plaqueta pela ficha
  const tid = await J(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[5].id);
  await ir('tumulo/' + tid);
  await p.click('[data-plaq="ligar"]'); await p.waitForSelector(dlg);
  ok((await p.inputValue(`${dlg} [name=numero]`)) === '000000', 'sugere o próximo número livre');
  await p.fill(`${dlg} [name=numero]`, '999'); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/ainda não foi gerado/.test(await erroForm()), 'número não gerado é recusado');
  await p.fill(`${dlg} [name=numero]`, '7'); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const t1 = await J((id) => { const t = VP.db.pega('tumulos', id); return { pl: t.plaqueta, qr: VP.codigoQR(t), af: t.qrAfixado, sit: VP.db.pega('plaquetas', '000007').situacao }; }, tid);
  ok(t1.pl === 7 && t1.qr === '000007' && t1.af && t1.sit === 'vinculada', 'plaqueta 000007 ligada; QR passa a levar o número: ' + JSON.stringify(t1));
  ok(await J((id) => VP.acharPorCodigo('7')?.id === id && VP.acharPorCodigo('000007')?.id === id, tid), 'busca pelo número da plaqueta (com ou sem zeros) acha o túmulo');
  await p.screenshot({ path: O + '/p-ficha.png' });
  // outro túmulo não pode usar o mesmo número
  const tid2 = await J(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[6].id);
  await ir('tumulo/' + tid2);
  await p.click('[data-plaq="ligar"]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name=numero]`, '000007'); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/já está ligado/.test(await erroForm()), 'número já ligado é recusado');
  await p.click(`${dlg} [data-fechar]`);
  // desligar (perdida) → inutilizada
  await ir('tumulo/' + tid);
  await p.click('[data-plaq="desligar"]'); await p.waitForSelector(dlg);
  await p.selectOption(`${dlg} [name=destino]`, 'inutilizada'); await p.fill(`${dlg} [name=motivo]`, 'Plaqueta quebrada'); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('tumulos', id).plaqueta == null && VP.db.pega('plaquetas', '000007').situacao === 'inutilizada' && VP.db.pega('plaquetas', '000007').historico.length === 3, tid), 'desligar: número inutilizado, histórico guardado');

  // numerar em lote pela lista (quadra 2)
  await ir('tumulos?quadraId=Q2');
  const n2 = await J(() => VP.estado.listaAtual.length);
  await p.click('#tab-tumulos [data-marcar-todos]'); await p.waitForTimeout(200);
  await p.click('#barra-lote [data-lote="numerar"]'); await p.waitForSelector(dlg);
  ok((await p.textContent(dlg)).includes('ordem do mapa'), 'prévia antes de ligar');
  await botaoDlg('Ligar plaquetas'); await p.waitForSelector(`${dlg} .resultado-numeros`); await fechar();
  const lote = await J(() => { const l = VP.db.lista('tumulos').filter((t) => t.quadraId === 'Q2'); return { com: l.filter((t) => t.plaqueta != null).length, total: l.length, nums: VP.ordenarTumulos(l).slice(0, 3).map((t) => t.plaqueta), prox: VP.plaquetas.proximo() }; });
  ok(lote.com === lote.total && lote.total === n2, `todos os ${n2} túmulos da Quadra 02 numerados`);
  ok(lote.nums[0] === 0 && lote.nums[1] === 1 && lote.nums[2] === 2, 'usa primeiro os números livres, na ordem do mapa: ' + lote.nums);
  ok(lote.prox === 60 + Math.max(0, n2 - 59), 'gera só os números que faltaram (próximo = ' + lote.prox + ')');
  // etiqueta mostra o número
  await ir('relatorio/etiquetas');
  await p.selectOption('[name=quadraId]', 'Q2'); await p.click('[data-gerar]'); await p.waitForTimeout(800);
  ok((await p.textContent('#etq')).includes('000000'), 'etiquetas da quadra mostram o número da plaqueta');
  await p.screenshot({ path: O + '/p-etiquetas.png' });
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true);
  ok(await J(() => VP.db.lista('tumulos').filter((t) => t.quadraId === 'Q2' && t.plaqueta != null).length > 0), 'depois de recarregar, as ligações continuam');
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
