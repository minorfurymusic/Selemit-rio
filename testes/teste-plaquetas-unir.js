// Plaquetas anteriores (registro com data e motivo), trocar plaqueta e unir cadastros do mesmo bem.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/escala-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' })).newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const [A, B, C] = await J(() => VP.db.lista('bens').filter((x) => x.tipo === 'movel' && x.status === 'ativo').slice(20, 23).map((x) => ({ id: x.id, pl: x.plaqueta })));
  // + plaqueta anterior
  await ir('bem/' + A.id);
  await p.click('[data-plaq-mais]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="plaqueta"]`, '777001'); await p.selectOption(`${dlg} [name="motivo"]`, 'Plaqueta caiu / perdida'); await p.fill(`${dlg} [name="observacao"]`, 'achada no chão (teste)');
  await botaoDlg('Registrar'); await p.waitForTimeout(500);
  await p.click('[data-plaq-mais]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="plaqueta"]`, '777002'); await p.selectOption(`${dlg} [name="motivo"]`, 'Plaqueta danificada (ilegível)');
  await botaoDlg('Registrar'); await p.waitForTimeout(500);
  let a = await J((id) => VP.db.pega('bens', id), A.id);
  ok(a.plaquetasAnteriores.length === 2 && a.plaquetasAnteriores[0].motivo === 'Plaqueta caiu / perdida' && a.plaquetasAnteriores[0].data && a.plaqueta === A.pl, 'botão +: duas plaquetas anteriores, cada uma com data e motivo; a atual não muda');
  ok((await p.textContent('#sec-plaquetas')).includes('777002'), 'ficha mostra o registro de plaquetas');
  // plaqueta já usada por outro bem: recusa
  await p.click('[data-plaq-mais]'); await p.waitForSelector(dlg); await p.fill(`${dlg} [name="plaqueta"]`, B.pl); await p.selectOption(`${dlg} [name="motivo"]`, 'Outro');
  await botaoDlg('Registrar'); await p.waitForTimeout(400);
  ok((await p.textContent(`${dlg} .erro-form`)).includes('Unir cadastros'), 'plaqueta de outro bem é recusada, sugerindo "Unir cadastros"');
  await botaoDlg('Cancelar');
  // trocar plaqueta
  await p.click('[data-plaq-trocar]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="nova"]`, '888001'); await p.selectOption(`${dlg} [name="motivo"]`, 'Troca de padrão de plaqueta');
  await botaoDlg('Trocar'); await p.waitForTimeout(500);
  a = await J((id) => VP.db.pega('bens', id), A.id);
  ok(a.plaqueta === '888001' && a.plaquetasAnteriores.some((x) => x.plaqueta === A.pl && /888001/.test(x.observacao)) && await J((id) => VP.eventosDoBem(id).some((e) => /Plaqueta trocada/.test(e.descricao)), A.id), 'trocar plaqueta: a antiga vai para o registro; fica no histórico');
  ok(await J(() => VP.filtrarBens({ busca: '777001' }).length === 1), 'busca acha o bem pela plaqueta antiga');
  // não reaproveita: novo bem com a plaqueta antiga
  const r = await J(async (pl) => { try { await VP.criarBens({ descricao: 'x', classificacaoId: VP.db.lista('bens')[0].classificacaoId, unidadeId: VP.db.lista('unidades')[0].id, valor: 1, plaqueta: pl }); return 'criou'; } catch (e) { return e.message; } }, A.pl);
  ok(/não é reaproveitada/.test(r), 'plaqueta antiga não pode ser usada em bem novo: ' + r);
  // unir cadastros: B e C são o mesmo bem
  await J(async (x) => { const c = VP.db.pega('bens', x.C.id); c.detalhes.serie = 'SERIE-DO-C'; c.localizacao = 'Sala 9 (teste)'; await VP.db.gravar('bens', c); const bb = VP.db.pega('bens', x.B.id); bb.detalhes.serie = ''; await VP.db.gravar('bens', bb); }, { B, C });
  await ir('bem/' + B.id);
  await p.click('.barra-acoes [data-acao="unir"]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="plaqueta"]`, C.pl); await botaoDlg('Conferir');
  await p.waitForSelector(`${dlg} .tabela-unir`);
  const difs = await p.$$eval('.tabela-unir tr.difere', (t) => t.length);
  ok(difs >= 2, 'tela de conferência lado a lado, com as diferenças em destaque: ' + difs);
  const iLoc = await J(() => VP.unirCadastros.CAMPOS.findIndex((f) => f.c === 'localizacao'));
  await p.check(`${dlg} input[name="u-${iLoc}"][value="b"]`);
  await p.screenshot({ path: O + '/unir-conferir.png', fullPage: true });
  await botaoDlg('Unir e desativar o outro'); await p.waitForTimeout(300);
  ok((await p.textContent(`${dlg} .erro-form`)).includes('motivo'), 'sem motivo não une');
  await p.fill(`${dlg} [data-unir-motivo]`, 'Inventário 2026: as duas plaquetas estavam no mesmo armário (teste)');
  await botaoDlg('Unir e desativar o outro'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar'); await p.waitForTimeout(500);
  const u1 = await J((x) => { const k = VP.db.pega('bens', x.B.id), o = VP.db.pega('bens', x.C.id); return { kSerie: k.detalhes.serie, kLoc: k.localizacao, kPlaq: VP.plaquetasAnteriores(k).map((y) => y.plaqueta), oSt: o.status, oUn: o.unidoA === k.id, baixa: VP.eventosDoBem(o.id).find((e) => e.tipo === 'baixa')?.dados.tipoBaixa, hist: VP.eventosDoBem(k.id).some((e) => /era o mesmo bem/.test(e.descricao) && /Inventário 2026/.test(e.descricao)), existe: !!o && !o.excluido }; }, { B, C });
  console.log('   união:', JSON.stringify(u1));
  ok(u1.kSerie === 'SERIE-DO-C' && u1.kLoc === 'Sala 9 (teste)' && u1.kPlaq.includes(C.pl), 'cadastro que fica recebe os dados escolhidos e a plaqueta do outro no registro de plaquetas');
  ok(u1.oSt === 'baixado' && u1.oUn && u1.baixa === 'Cadastro duplicado (mesmo bem)' && u1.existe, 'o outro é desativado (baixa "Cadastro duplicado"), nunca apagado');
  ok(u1.hist, 'histórico diz que era o mesmo bem, com o motivo');
  // desfazer
  await ir('bem/' + B.id);
  await p.click('[data-desfazer-uniao]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer união'); await p.waitForTimeout(600);
  const u2 = await J((x) => { const k = VP.db.pega('bens', x.B.id), o = VP.db.pega('bens', x.C.id); return { oSt: o.status, kSerie: k.detalhes.serie, kLoc: k.localizacao, estorno: VP.eventosDoBem(o.id).some((e) => e.tipo === 'estorno') }; }, { B, C });
  ok(u2.oSt === 'ativo' && u2.kSerie === '' && u2.kLoc !== 'Sala 9 (teste)' && u2.estorno, 'desfazer união: o outro volta ativo (baixa estornada) e os dados voltam ao que eram');
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
