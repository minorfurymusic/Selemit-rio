// Etapa 5 do Patrimônio (demonstração): imóveis — documentos, cessões, pendências, demonstrativo TCE.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = __dirname + '/gestao-teste';
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
  const preencher = async (o) => { for (const [k, v] of Object.entries(o)) { const el = await p.$(`${dlg} [name="${k}"]`); const tag = await el.evaluate((e) => e.tagName + e.type); if (tag.startsWith('SELECT')) await el.selectOption(v); else if (tag === 'INPUTcheckbox') { if (v) await el.check(); else await el.uncheck(); } else if (tag === 'INPUTfile') await el.setInputFiles(v); else await el.fill(v); } };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const s = await J(() => ({ d: VP.db.lista('documentosImovel').length, c: VP.db.lista('cessoesImovel').length, a: VP.imoveis.alertas() }));
  ok(s.d > 0 && s.c === 2, `semente: ${s.d} documentos e ${s.c} cessões de exemplo`);
  ok(s.a.docsVencidos.length >= 1 && s.a.cessoesVencidas.length === 1, 'alertas: documento vencido e cessão vencida de exemplo');
  for (const h of ['imoveis', 'imoveis/demonstrativo', 'imoveis/documentos', 'imoveis/cessoes', 'imoveis/pendencias']) { await ir(h); const t = await p.textContent('#titulo-tela'); ok(t === 'Bens imóveis', `tela #${h} abre`); }
  await ir('imoveis'); await p.screenshot({ path: O + '/imoveis-painel.png', fullPage: true });
  ok(await p.$eval('#menu a.ativo', (a) => a.dataset.rota) === 'bens/imoveis', 'menu acende "Bens imóveis"');
  await ir('imoveis/demonstrativo');
  const demo = await p.textContent('#corpo-demo');
  ok(demo.includes('Sem registro') || demo.includes('Em regularização'), 'demonstrativo agrupa por situação do registro');
  await p.screenshot({ path: O + '/imoveis-demonstrativo.png', fullPage: true });
  ok(await J(() => VP.pendencias().some((x) => x.chave === 'imo-docs')), 'central de pendências mostra documentos de imóveis vencidos');

  // ficha de um imóvel
  const bid = await J(() => VP.db.lista('bens').find((x) => x.tipo === 'imovel' && x.imovel.uso === 'Uso especial').id);
  await ir('bem/' + bid);
  ok((await p.textContent('#conteudo')).includes('Documentos do imóvel') && (await p.textContent('#conteudo')).includes('Regularização'), 'ficha do imóvel com documentos, cessões e regularização');
  // editar dados do imóvel (afetado, motivo)
  await p.click('[data-editar="imovel"]'); await p.waitForSelector(dlg);
  await preencher({ 'imovel.situacaoRegistro': 'Em regularização', 'imovel.motivoPendencia': 'Matrícula com área divergente (teste)', 'imovel.areaTerreno': '1200', 'imovel.afetado': true });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const ed = await J((id) => VP.db.pega('bens', id).imovel, bid);
  ok(ed.situacaoRegistro === 'Em regularização' && ed.motivoPendencia.includes('divergente') && ed.areaTerreno === 1200 && ed.afetado === true, 'dados do imóvel salvos (situação, motivo, área, afetado)');
  ok(await J((id) => VP.eventosDoBem(id).some((e) => e.tipo === 'alteracao' && /O que impede/.test(e.descricao)), bid), 'alteração vai para a linha do tempo');
  // documento com validade antes da emissão → barrado
  await ir('bem/' + bid);
  await p.click('[data-imo="doc"]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'Alvará sanitário', numero: 'AS-77', emissao: '2026-05-01', validade: '2026-01-01' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/antes da emissão/.test(await erroForm()), 'validade antes da emissão é barrada');
  await preencher({ validade: '2026-11-01', arquivos: { name: 'alvara.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 teste') } });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const doc = await J((id) => VP.imoveis.docsDe(id).find((d) => d.numero === 'AS-77'), bid);
  ok(doc && VP_sit(doc) !== null, 'documento salvo com arquivo');
  ok(await J((id) => VP.imoveis.situacaoDoc(VP.imoveis.docsDe(id).find((d) => d.numero === 'AS-77')) === 'vencendo', bid), 'documento que vence em menos de 60 dias aparece como "vencendo"');
  // cessão
  await ir('bem/' + bid);
  await p.click('[data-imo="cessao"]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'permissao', direcao: 'a-terceiros', parte: 'Cooperativa Exemplo', instrumento: 'Termo 5/2026', inicio: '2026-01-01', fim: '2026-12-31' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  await ir('bem/' + bid);
  const cid = await J((id) => VP.imoveis.cessoesDe(id).find((c) => c.parte === 'Cooperativa Exemplo').id, bid);
  await p.click(`[data-imo-renovar="${cid}"]`); await p.waitForSelector(dlg);
  await preencher({ fim: '2027-12-31', instrumento: 'Aditivo 1' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('cessoesImovel', id).fim === '2027-12-31' && VP.db.pega('cessoesImovel', id).historico.length === 2, cid), 'cessão renovada com histórico');
  // pendência → andamento → resolvida
  await ir('bem/' + bid);
  await p.click('[data-imo="pendencia"]'); await p.waitForSelector(dlg);
  await preencher({ descricao: 'Retificar a área na matrícula (teste)', responsavelId: await p.$eval(`${dlg} [name=responsavelId] option:nth-child(2)`, (o) => o.value), prazo: '2026-12-01' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const pid = await J((id) => VP.imoveis.pendenciasDe(id).find((x) => x.descricao.includes('Retificar')).id, bid);
  await ir('bem/' + bid);
  await p.click(`[data-imo-pend="${pid}"]`); await p.waitForSelector(dlg);
  await preencher({ acao: 'resolvida', nota: 'Matrícula retificada (teste)' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('pendenciasImovel', id).situacao === 'resolvida', pid), 'pendência resolvida com histórico');
  await ir('bem/' + bid); await p.screenshot({ path: O + '/imoveis-ficha.png', fullPage: true });
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  ok(await J((id) => VP.imoveis.docsDe(id).some((d) => d.numero === 'AS-77'), bid), 'depois de recarregar, tudo continua');
  await p.setViewportSize({ width: 390, height: 844 });
  for (const h of ['imoveis', 'imoveis/demonstrativo', 'bem/' + bid]) { await ir(h); const w = await J(() => document.documentElement.scrollWidth); ok(w <= 392, `#${h.split('/')[0]} no celular sem rolagem lateral (${w})`); }
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
function VP_sit(d) { return d && d.arquivos && d.arquivos.length === 1 ? 1 : null; }
