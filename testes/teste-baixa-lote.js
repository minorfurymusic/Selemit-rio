// Baixa em lote (leilão): montar, incluir inservíveis e plaquetas, anexar ata, confirmar; nada é apagado.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/escala-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
fs.writeFileSync('/tmp/ata-leilao-ficticia.pdf', '%PDF-1.4\n% ata FICTÍCIA de leilão (teste)\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n');
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
  const fechaResultado = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(400); };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  // 3 bens inservíveis + 1 em uso
  const ids = await J(async () => {
    const bs = VP.db.lista('bens').filter((b) => b.tipo === 'movel' && b.status === 'ativo').slice(10, 14);
    for (const x of bs.slice(0, 3)) x.status = 'inservivel';
    await VP.db.gravar('bens', bs);
    return { insv: bs.slice(0, 3).map((x) => x.id), ativo: bs[3].id, plAtivo: bs[3].plaqueta, total: VP.db.lista('bens', true).length };
  });
  await ir('baixa-lote');
  ok((await p.textContent('#titulo-tela')) === 'Baixa em lote' && !!(await p.$('#menu a[data-rota="baixa-lote"]')), 'menu e tela Baixa em lote');
  await p.click('[data-novo-lote]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="edital"]`, 'Edital 3/2026 (fictício)');
  await botaoDlg('Criar lote'); await p.waitForTimeout(600);
  const loteId = await J(() => location.hash.split('/')[1]);
  ok(/^#baixa-lote\//.test(await J(() => location.hash)) && (await p.textContent('#titulo-tela')).includes('1/2026'), 'lote criado com número 1/2026 e aberto');
  await p.click('[data-incluir-inserviveis]'); await fechaResultado();
  await p.fill('[data-plaquetas]', `${ids.plAtivo} 999999`); await p.click('[data-incluir-plaquetas]');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  const r1 = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  await fechaResultado();
  ok(/Deram certo ?1/.test(r1) && /Não existe/.test(r1), 'incluir por plaqueta: a que existe entra, a que não existe aparece como falha');
  let l = await J((id) => VP.db.pega('lotesBaixa', id), loteId);
  ok(l.bens.length === 4 && ids.insv.every((x) => l.bens.includes(x)), 'lote com os 3 inservíveis + 1 por plaqueta');
  // confirmar sem ata e sem avaliação: não deixa
  await p.click('[data-confirmar-lote]'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const r2 = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  await fechaResultado();
  ok(/ata/.test(r2) && /avaliação prévia/.test(r2), 'confirmar sem ata e sem avaliação: o sistema mostra o que falta');
  // tira o bem em uso, preenche dados, valor arrematado e ata
  await p.click(`[data-tirar-bem="${ids.ativo}"]`); await p.waitForTimeout(500);
  await p.click('[data-editar-lote]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="avaliacao"]`, 'Laudo de avaliação 7/2026 (fictício)'); await p.fill(`${dlg} [name="justificativa"]`, 'Bens inservíveis sem uso pela administração (teste)');
  const mot = await p.$$eval(`${dlg} [name="motivo"] option`, (os) => os.map((o) => o.value).filter(Boolean));
  if (mot.length) await p.selectOption(`${dlg} [name="motivo"]`, mot[0]);
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  await p.fill(`[data-arrematado="${ids.insv[0]}"]`, '150,50'); await p.press(`[data-arrematado="${ids.insv[0]}"]`, 'Tab'); await p.waitForTimeout(300);
  await p.setInputFiles('[data-anexar-ata]', '/tmp/ata-leilao-ficticia.pdf'); await p.waitForTimeout(800);
  l = await J((id) => VP.db.pega('lotesBaixa', id), loteId);
  ok(l.bens.length === 3 && !l.bens.includes(ids.ativo) && l.ata.length === 1 && /^data:application\/pdf/.test(l.ata[0].dataURL) && l.valores[ids.insv[0]] === 150.5, 'tirar bem, valor arrematado e ata em PDF guardados no lote (antes de confirmar)');
  ok(mot.length > 0, 'motivo de baixa escolhido');
  await p.screenshot({ path: O + '/lote-montagem.png', fullPage: true });
  // confirmar
  await p.click('[data-confirmar-lote]'); await p.waitForSelector(dlg); await botaoDlg('Confirmar baixa');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  const r3 = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  ok(/Deram certo ?3/.test(r3) && !!(await p.$('[data-termo-lote]')), 'baixa confirmada: 3 bens, com termo de baixa');
  await fechaResultado();
  const g = await J((x) => {
    const bs = x.insv.map((id) => VP.db.pega('bens', id));
    const evs = x.insv.map((id) => VP.eventosDoBem(id).find((e) => e.tipo === 'baixa'));
    const l = VP.db.pega('lotesBaixa', x.loteId);
    return { st: bs.map((b) => b.status).join(), excl: bs.some((b) => b.excluido), lote: bs.every((b) => b.loteBaixaId === x.loteId), evLote: evs.every((e) => e && e.dados.loteBaixaId === x.loteId && e.dados.tipoBaixa === 'Alienação (leilão)'), arr: evs[0].dados.valorArrematado, situ: l.situacao, ata: l.ata.length, total: VP.db.lista('bens', true).length, naLista: VP.filtrarBens({}).filter((b) => x.insv.includes(b.id)).length, ativo: VP.db.pega('bens', x.ativo).status };
  }, Object.assign({ loteId }, ids));
  console.log('   depois:', JSON.stringify(g));
  ok(g.st === 'baixado,baixado,baixado' && g.lote && g.evLote && g.arr === 150.5, 'cada bem baixado com o lote e o valor arrematado no histórico');
  ok(!g.excl && g.total === ids.total && g.naLista === 0, 'nada apagado: os bens continuam no banco (fora da lista de bens em uso)');
  ok(g.situ === 'confirmado' && g.ata === 1 && g.ativo === 'ativo', 'lote confirmado com a ata; o bem tirado continua em uso');
  ok(!(await p.$('[data-confirmar-lote]')) && !(await p.$('[data-tirar-bem]')) && !!(await p.$('[data-termo-lote2]')), 'lote confirmado fica só para consulta (com termo para imprimir)');
  await ir('bem/' + ids.insv[0]);
  ok((await p.textContent('#conteudo')).includes('Baixado no lote'), 'ficha do bem mostra o lote da baixa');
  // da lista de bens: incluir em lote novo; lote em montagem aparece nas pendências; excluir lote vai para a Lixeira
  await J((id) => VP.baixaLote.escolherLote([VP.db.pega('bens', id)]), ids.ativo); await p.waitForSelector(dlg);
  await botaoDlg('Incluir'); await fechaResultado();
  const l2 = await J(() => VP.db.lista('lotesBaixa').find((x) => x.situacao === 'rascunho'));
  ok(l2 && l2.numero === '2/2026' && l2.bens.length === 1 && await J(() => VP.pendencias().some((x) => x.chave === 'lotes-baixa')), 'da lista de bens: novo lote 2/2026 criado com o bem; pendência "lotes em montagem"');
  await ir('baixa-lote/' + l2.id);
  await p.click('[data-excluir-lote]'); await p.waitForSelector(dlg); await botaoDlg('Mover para a Lixeira'); await p.waitForTimeout(600);
  await ir('lixeira');
  ok((await p.textContent('#conteudo')).includes('Lote de baixa'), 'lote excluído vai para a Lixeira (pode voltar)');
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
