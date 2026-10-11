// Frota, segunda parte (demonstração): pneus, reservas, cartão-combustível, dias parados; estado "Novo" no app de campo.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/frota-prints';
fs.mkdirSync(O, { recursive: true });
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
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const erroForm = () => p.textContent(`${dlg} .erro-form`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };
  const preencher = async (o) => { for (const [k, v] of Object.entries(o)) { const el = await p.$(`${dlg} [name="${k}"]`); const tag = await el.evaluate((e) => e.tagName + e.type); if (tag.startsWith('SELECT')) await el.selectOption(v); else if (tag === 'INPUTcheckbox') { if (v) await el.check(); else await el.uncheck(); } else await el.fill(v); } };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  for (const h of ['frota/pneus', 'frota/reservas', 'frota/cartao', 'frota/contratos', 'frota']) { await ir(h); ok((await p.textContent('#titulo-tela')) === 'Frota de veículos' && !(await p.textContent('#conteudo')).includes('errado'), `tela #${h} abre`); }

  // ---- pneus
  await ir('frota/pneus');
  const v1 = await J(() => VP.db.pega('pneus', 'PN0').ref);
  await J(() => VP.frotaExtra.instalar(VP.db.pega('pneus', 'PN4'))); await p.waitForSelector(dlg);
  await preencher({ ref: v1, posicao: 'DE', km: '999999' }); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/já tem o pneu FOGO-001/.test(await erroForm()), 'posição ocupada é recusada');
  await preencher({ posicao: 'EST', km: '1' }); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/menor que o último/.test(await erroForm()), 'km menor que o do veículo é recusado');
  const kmV = await J((r) => VP.frota.kmAtual(r), v1);
  await preencher({ km: String(kmV) }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.pega('pneus', 'PN4').situacao === 'rodando' && VP.db.pega('pneus', 'PN4').posicao === 'EST'), 'pneu do estoque instalado como estepe');
  // rodízio DE ↔ EST troca os dois
  await J(() => VP.frotaExtra.rodizio(VP.db.pega('pneus', 'PN0'))); await p.waitForSelector(dlg);
  await preencher({ posicao: 'EST' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.pega('pneus', 'PN0').posicao === 'EST' && VP.db.pega('pneus', 'PN4').posicao === 'DE'), 'rodízio troca os dois pneus de lugar');
  // retirar para recapagem e voltar
  const kmInst = await J(() => VP.db.pega('pneus', 'PN1').kmInstalacao);
  await J(() => VP.frotaExtra.retirar(VP.db.pega('pneus', 'PN1'))); await p.waitForSelector(dlg);
  await preencher({ km: String(kmV + 500), destino: 'recapagem', motivo: 'Desgaste' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const pn1 = await J(() => ({ s: VP.db.pega('pneus', 'PN1').situacao, km: VP.frotaExtra.kmPneu(VP.db.pega('pneus', 'PN1')) }));
  ok(pn1.s === 'recapagem' && pn1.km === kmV + 500 - kmInst && kmInst > 0, 'retirado para recapagem com os km rodados guardados: ' + JSON.stringify(pn1));
  await J(() => VP.frotaExtra.voltaRecapagem(VP.db.pega('pneus', 'PN1'))); await p.waitForSelector(dlg);
  await preencher({ valor: '180,00' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.pega('pneus', 'PN1').recapagens === 1 && VP.db.pega('pneus', 'PN1').situacao === 'estoque'), 'volta da recapagem: 1 recapagem, de volta ao estoque');
  await ir('frota/pneus'); await p.screenshot({ path: O + '/pneus.png', fullPage: true });

  // ---- reservas
  await ir('frota/reservas');
  const refA = await J(() => VP.frota.veiculos().find((v) => v.situacao === 'ativo').ref);
  await J(([r]) => VP.frotaExtra.decidirReserva(VP.db.pega('reservasVeiculo', 'RV1'), 'aprovada'), [refA]); await p.waitForSelector(dlg);
  await preencher({ ref: refA, motoristaId: 'M1' }); await botaoDlg('Aprovar'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.pega('reservasVeiculo', 'RV1').situacao === 'aprovada'), 'pedido da secretaria aprovado com veículo');
  // segundo pedido no mesmo horário e veículo → conflito
  await p.click('[data-nova-reserva]'); await p.waitForSelector(dlg);
  const d = await J(() => VP.db.pega('reservasVeiculo', 'RV1').data);
  await preencher({ unidadeId: 'U1', solicitante: 'Escola (teste)', data: d, horaInicio: '10:00', horaFim: '11:00', destino: 'Centro' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const rid = await J(() => VP.db.lista('reservasVeiculo').find((r) => r.solicitante === 'Escola (teste)').id);
  await J((id) => VP.frotaExtra.decidirReserva(VP.db.pega('reservasVeiculo', id), 'aprovada'), rid); await p.waitForSelector(dlg);
  await preencher({ ref: refA }); await botaoDlg('Aprovar'); await p.waitForTimeout(300);
  ok(/já está reservado nesse horário/.test(await erroForm()), 'reserva em conflito de horário é recusada');
  await p.click(`${dlg} [data-fechar]`);
  await ir('frota/reservas'); await p.screenshot({ path: O + '/reservas.png', fullPage: true });

  // ---- cartão-combustível
  await ir('frota/cartao');
  const placa = await J((r) => VP.frota.veiculo(r).placa, refA);
  const km0 = await J((r) => VP.frota.kmAtual(r), refA);
  const csv = `Data;Hora;Placa;Litros;Valor total;Km;Combustível;Posto;Motorista\n05/10/2026;08:10;${placa};30,5;189,40;${km0 + 300};Gasolina;Posto Exemplo;Fulano\n05/10/2026;08:10;${placa};30,5;189,40;${km0 + 300};Gasolina;Posto Exemplo;Fulano\n06/10/2026;09:00;ZZZ9Z99;20;100;1000;Diesel;Posto X;Beltrano`;
  fs.writeFileSync('/tmp/cartao.csv', '﻿' + csv);
  await p.setInputFiles('[data-arquivo-cartao]', '/tmp/cartao.csv'); await p.waitForSelector('#previa-cartao');
  const prev = await J(() => VP.estado.cartao.previa.itens.map((i) => i.classe));
  ok(prev.join() === 'novo,conflito,erro', 'prévia: 1 nova, 1 repetida no próprio arquivo e 1 com placa desconhecida: ' + prev);
  await p.screenshot({ path: O + '/cartao-previa.png', fullPage: true });
  await p.click('[data-aplicar-cartao]'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const t = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  ok(/Deram certo ?1/.test(t) && t.includes('não cadastrada') && t.includes('Repetido no arquivo'), 'importado: 1 lançado; repetido e placa desconhecida listados com o motivo');
  await fechar();
  const n1 = await J((r) => VP.frota.abastecimentos().filter((a) => a.ref === r).length, refA);
  // importar o mesmo arquivo de novo: tudo "já registrado"
  await p.setInputFiles('[data-arquivo-cartao]', '/tmp/cartao.csv'); await p.waitForSelector('#previa-cartao');
  ok(await J(() => VP.estado.cartao.previa.itens.filter((i) => i.classe === 'igual').length === 1), 'mesmo arquivo de novo: a linha lançada aparece como já registrada');
  await p.click('[data-descartar-cartao]'); await p.waitForTimeout(300);
  // desfazer
  await p.click('[data-desfazer-cartao]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer'); await p.waitForTimeout(500);
  ok(await J(([r, n]) => VP.frota.abastecimentos().filter((a) => a.ref === r).length === n - 1, [refA, n1]), 'desfazer tira o abastecimento lançado dos custos');

  // ---- dias parados
  await ir('frota/contratos');
  const mesPassado = await J(() => VP.u.somaMeses(VP.Plataforma.hoje().slice(0, 7), -1));
  const conf = await J((ym) => ({ dias: VP.frota.diasParados('L:VL1', ym) }), mesPassado);
  ok(conf.dias === 4, 'parada de 10 a 13 do mês passado = 4 dias parados');
  const linha = await p.textContent('#tab-frota-conferencia');
  ok(linha.includes('Dias parados') && linha.includes('Desconto por parada'), 'conferência mostra dias parados e desconto');
  await p.screenshot({ path: O + '/conferencia-parados.png', fullPage: true });
  await p.click('[data-nova-parada]'); await p.waitForSelector(dlg);
  await preencher({ ref: 'L:VL2', inicio: `${mesPassado}-20`, fim: `${mesPassado}-21`, motivo: 'Teste', substituto: true }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((ym) => VP.frota.diasParados('L:VL2', ym) === 0, mesPassado), 'parada com carro reserva não conta para desconto');

  // ---- estado Novo no app de campo
  await p.goto('http://localhost:8765/patrimonio/app-campo/#bens'); await p.waitForSelector('#estado', { state: 'attached' });
  ok((await p.$$('#estado button')).length === 8 && (await p.getAttribute('#estado button[data-valor="8"]', 'title')) === 'Novo' && (await p.textContent('#estado button[data-valor="1"]')) === 'Imprestável', 'app de campo: estado de conservação em 8 níveis (8 = Novo, 1 = Imprestável), com o nome no botão');
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
