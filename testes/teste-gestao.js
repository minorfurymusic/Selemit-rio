const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const S = process.argv[2], O = S + '/gestao-teste', URL = 'http://localhost:8765/patrimonio/gestao/';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', acceptDownloads: true });
  await ctx.addInitScript(() => { window.print = () => { window.__impresso = (window.__impresso || 0) + 1; }; });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(250); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const fecharResultado = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(150); };

  // login
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(p.url().includes('/patrimonio/gestao/'), 'login patrimonio abre a Gestão');
  await p.screenshot({ path: O + '/01-painel.png', fullPage: true });

  // balancete fecha
  await ir('#relatorio/balancete');
  ok((await p.textContent('.nota-relatorio')).includes('✓'), 'balancete: saldo anterior + entradas − saídas − depreciação = saldo final');

  // busca por faixa de código
  await ir('#bens');
  await p.fill('.busca', '1-5'); await p.waitForTimeout(500);
  ok((await p.$$('#tab-bens tbody tr')).length === 5, 'busca "1-5" traz 5 bens');
  await p.fill('.busca', 'geladeira vacinas'); await p.waitForTimeout(500);
  ok((await p.$$('#tab-bens tbody tr')).length >= 1, 'busca por palavras acha "Geladeira de vacinas"');
  await p.click('[data-limpar]'); await p.waitForTimeout(200);

  // novo bem x3
  const antes = await J(() => VP.db.lista('bens').length);
  await ir('#novo-bem/movel');
  await p.fill('#f-descricao', 'Notebook'); await p.waitForTimeout(150);
  await p.click('[data-usar-anterior]'); await p.waitForTimeout(150);
  await p.selectOption('#form-novo [name=unidadeId]', 'U1');
  await p.fill('#form-novo [name=valor]', '4500,00');
  await p.fill('#form-novo [name=quantidade]', '3');
  await p.waitForTimeout(100);
  ok((await p.textContent('#previa-novo')).includes('3 bem(ns)'), 'novo bem: prévia mostra 3 bens e conta da classificação');
  await p.screenshot({ path: O + '/02-novo-bem.png', fullPage: true });
  await p.click('#form-novo button[type=submit]');
  await fecharResultado();
  const novos = await J(() => VP.db.lista('bens').filter(b => b.descricao === 'Notebook' && b.dataIncorporacao === VP.Plataforma.hoje()).map(b => ({ c: b.codigo, r: b.responsavelId, conta: b.contaId, vida: b.depreciacao.vidaUtilMeses })));
  ok(novos.length === 3 && novos[1].c === novos[0].c + 1 && novos[0].r === 'R1' && novos[0].conta === 'C_INF' && novos[0].vida === 60, 'novo bem: 3 bens, códigos seguidos, responsável da unidade, conta e vida útil da classificação');
  ok(p.url().includes('#bem/'), 'novo bem: abre a ficha');

  // editar seção com registro no histórico
  await p.click('[data-editar="detalhes"]');
  await p.fill(`${dlg} [name="detalhes.marca"]`, 'Marca Teste');
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok((await p.textContent('#linha-tempo')).includes('Alteração de dados'), 'editar: alteração registrada na linha do tempo');
  await p.screenshot({ path: O + '/03-ficha.png', fullPage: true });

  // transferência com aceite
  const ids = await J(() => VP.db.lista('bens').filter(b => b.descricao === 'Notebook' && b.unidadeId === 'U1').slice(0, 2).map(b => b.id));
  await J((i) => { VP.acoes.transferir(i.map(x => VP.db.pega('bens', x)), () => {}); }, ids);
  await p.selectOption(`${dlg} [name=tipo]`, 'interna');
  await p.selectOption(`${dlg} [name=destinoUnidadeId]`, 'U2');
  await botaoDlg('Transferir'); await fecharResultado();
  ok(await J((i) => VP.db.pega('bens', i[0]).unidadeId === 'U1', ids), 'transferência interna fica aguardando aceite (bem ainda na origem)');
  await ir('#transferencias');
  await p.click('[data-aceitar]'); await p.waitForTimeout(300);
  ok(await J((i) => i.every(x => VP.db.pega('bens', x).unidadeId === 'U2'), ids), 'aceite: bens passam para a unidade de destino');

  // baixa: leilão exige avaliação e justificativa
  await J((i) => { VP.acoes.baixa([VP.db.pega('bens', i[0])], () => {}); }, ids);
  await p.selectOption(`${dlg} [name=tipoBaixa]`, 'Alienação (leilão)');
  await p.selectOption(`${dlg} [name=motivo]`, 'Leilão');
  await botaoDlg('Dar baixa'); await p.waitForTimeout(200);
  ok((await p.textContent(`${dlg} .erro-form`)).includes('art. 76'), 'baixa por leilão sem avaliação é recusada (Lei 14.133 art. 76)');
  await p.fill(`${dlg} [name=avaliacao]`, 'Laudo 12/2026'); await p.fill(`${dlg} [name=justificativa]`, 'Bem sem uso, conserto caro');
  await botaoDlg('Dar baixa'); await fecharResultado();
  ok(await J((i) => { const b = VP.db.pega('bens', i[0]); return b.status === 'baixado' && VP.saldo(b).liquido === 0; }, ids), 'baixa: bem baixado e valor contábil zero');

  // fechamento do mês + desfazer
  await ir('#financeiro/fechamento');
  const nFech = await J(() => VP.db.lista('fechamentos').filter(f => f.situacao === 'fechado').length);
  await p.screenshot({ path: O + '/04-fechamento.png', fullPage: true });
  await p.click('[data-fechar]'); await botaoDlg('Fechar'); await fecharResultado();
  ok(await J(() => VP.db.lista('fechamentos').filter(f => f.situacao === 'fechado').length) === nFech + 1, 'fechar o mês cria o fechamento');
  await ir('#financeiro/fechamento');
  await p.click('[data-desfazer]'); await botaoDlg('Desfazer'); await p.waitForTimeout(400);
  const desf = await J(() => { const f = VP.db.lista('fechamentos').find(x => x.situacao === 'desfeito'); return f && VP.db.lista('eventos').filter(e => e.loteId === f.loteId).every(e => e.cancelado); });
  ok(desf, 'desfazer fechamento: lançamentos ficam no histórico como desfeitos');
  await ir('#financeiro/fechamento'); await p.click('[data-fechar]'); await botaoDlg('Fechar'); await fecharResultado();

  // reavaliação em bloco (percentual) + desfazer
  const reav = await J(() => VP.db.lista('bens').filter(b => b.status === 'ativo' && b.tipo === 'movel').slice(0, 3).map(b => ({ id: b.id, v: VP.saldo(b).liquido })));
  await J((r) => { VP.estado.reavaliarIds = r.map(x => x.id); location.hash = '#financeiro/reavaliacao'; }, reav);
  await p.waitForTimeout(300);
  await p.selectOption('#area-reav [name=forma]', 'percentual');
  await p.fill('#area-reav [name=percentual]', '10'); await p.dispatchEvent('#area-reav [name=percentual]', 'change');
  await p.fill('#area-reav [name=laudo]', 'L-01/2026');
  await p.check('[data-ok-comissao]'); await p.check('[data-ok-contabil]');
  await p.screenshot({ path: O + '/05-reavaliacao.png', fullPage: true });
  await p.click('[data-aplicar-reav]'); await fecharResultado();
  const reavOk = await J((r) => r.every(x => Math.abs(VP.saldo(VP.db.pega('bens', x.id)).liquido - Math.round(x.v * 1.1 * 100) / 100) < 0.02), reav);
  ok(reavOk, 'reavaliação +10%: valor novo de cada bem = valor atual × 1,10');
  await p.click('[data-desfazer-reav]'); await botaoDlg('Desfazer'); await p.waitForTimeout(400);
  ok(await J((r) => r.every(x => Math.abs(VP.saldo(VP.db.pega('bens', x.id)).liquido - x.v) < 0.02), reav), 'desfazer reavaliação volta ao valor anterior');

  // itens a incorporar
  await ir('#entradas');
  const nAntes = await J(() => VP.db.lista('bens').length);
  await p.click('[data-incorporar="IT1"]');
  await p.selectOption(`${dlg} [name=unidadeId]`, 'U5');
  await botaoDlg('Incorporar'); await fecharResultado();
  ok(await J((n) => VP.db.lista('bens').length === n + 10 && VP.db.pega('itensIncorporar', 'IT1').incorporados === 10, nAntes), 'incorporar item: 10 cadeiras viram 10 bens, item fica sem saldo');
  ok(await J(() => VP.db.lista('bens').filter(b => b.origem?.empenho?.includes('840')).length === 10), 'bens incorporados levam o empenho');

  // registros do aplicativo de campo no mesmo navegador (simulados)
  await J(() => new Promise((ok) => { const r = indexedDB.open('vitalpat-patrimonio', 1); r.onupgradeneeded = () => r.result.createObjectStore('registros', { keyPath: 'id' }); r.onsuccess = () => { const t = r.result.transaction('registros', 'readwrite'); const s = t.objectStore('registros'); s.put({ id: 'a1', tipo: 'bem', criadoEm: new Date().toISOString(), situacao: 'aguardando', fotos: [], dados: { plaqueta: '1001', unidade: 'U1', estado: '3' } }); s.put({ id: 'a2', tipo: 'bem', criadoEm: new Date().toISOString(), situacao: 'aguardando', fotos: [], dados: { plaqueta: '9999', descricao: 'Cadeira azul', unidade: 'U1', estado: '2' } }); s.put({ id: 'a3', tipo: 'abastecimento', criadoEm: new Date().toISOString(), situacao: 'aguardando', fotos: [], dados: { placa: 'TST1A01', litros: 40, valor: 240, combustivel: 'Gasolina', km: 46000 } }); t.oncomplete = () => ok(); }; }));

  // inventário
  await ir('#inventario');
  await p.click('[data-abrir]'); await botaoDlg('Abrir'); await p.waitForTimeout(400);
  await p.click('[data-importar-app]'); await p.waitForTimeout(400);
  const txtImp = await p.textContent(dlg);
  ok(txtImp.includes('Plaqueta 1001: conferido') && txtImp.includes('sobra') && txtImp.includes('TST1A01'), 'importar do aplicativo de campo: conferência, sobra e abastecimento');
  await fecharResultado();
  await p.click('[data-conferir="U1"]'); await p.waitForTimeout(200);
  const deOutra = await J(() => VP.db.lista('bens').find(b => b.unidadeId === 'U3' && b.status !== 'baixado'));
  await p.fill(`${dlg} [data-leitura]`, deOutra.plaqueta); await p.press(`${dlg} [data-leitura]`, 'Enter');
  await p.waitForSelector('dialog.janela[open] footer button:has-text("Registrar aqui")'); await p.click('dialog.janela[open] footer button:has-text("Registrar aqui")'); await p.waitForTimeout(300);
  await p.screenshot({ path: O + '/06-conferir-unidade.png', fullPage: true });
  await p.click(`${dlg} footer button:has-text("Fechar")`); await p.waitForTimeout(300);
  await p.screenshot({ path: O + '/07-inventario.png', fullPage: true });
  await p.click('[data-encerrar]'); await botaoDlg('Encerrar'); await p.waitForTimeout(600);
  ok(await J((id) => VP.db.pega('bens', id).unidadeId === 'U1', deOutra.id), 'encerrar inventário: bem achado em outra unidade vira transferência');
  ok(p.url().includes('relatorio/inventario'), 'encerrar inventário abre o relatório');
  await p.screenshot({ path: O + '/08-relatorio-inventario.png', fullPage: true });

  // contabilidade
  await ir('#financeiro/contabilidade');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-gerar-arquivo]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(csv.startsWith('﻿Data;Tipo;Código do bem') && csv.split('\r\n').length > 5, 'arquivo para a contabilidade gerado (CSV com contas)');
  await fecharResultado();
  ok(await J(() => VP.movimentosAContabilizar().length === 0), 'movimentos marcados como enviados');

  // etiquetas
  await J((i) => { VP.estado.etiquetasIds = i; location.hash = '#relatorio/etiquetas'; }, reav.map(x => x.id));
  await p.waitForTimeout(300);
  await p.click('[data-gerar-etiquetas]'); await p.waitForTimeout(200);
  ok((await p.$$('#etiquetas-previa .etiqueta svg')).length === 3, 'etiquetas: 3 etiquetas com QR Code');
  await p.screenshot({ path: O + '/09-etiquetas.png', fullPage: true });
  await p.click('[data-imprimir-etq]'); await p.waitForTimeout(200);
  ok(await J(() => window.__impresso >= 1 && document.getElementById('area-impressao').innerHTML.includes('etiqueta')), 'impressão das etiquetas chamada');

  // planilha com colunas escolhidas
  await ir('#bens');
  await p.click('#tab-bens [data-planilha]');
  await p.click(`${dlg} [data-nenhuma]`);
  await p.check(`${dlg} .colunas input[value=codigo]`); await p.check(`${dlg} .colunas input[value=valor]`);
  await p.selectOption(`${dlg} [data-formato]`, 'csv'); // Excel é o padrão; aqui confere o CSV
  const [dl2] = await Promise.all([p.waitForEvent('download'), botaoDlg('Baixar')]);
  const csv2 = fs.readFileSync(await dl2.path(), 'utf8');
  ok(csv2.split('\r\n')[0] === '﻿Código;Valor contábil', 'planilha de bens só com as colunas escolhidas');

  // excluir → lixeira → restaurar
  const alvo = novos[2].c;
  const idAlvo = await J((c) => VP.db.lista('bens').find(b => b.codigo === c).id, alvo);
  await ir('#bem/' + idAlvo);
  await p.click('[data-acao=excluir]'); await botaoDlg('Mover para a Lixeira'); await p.waitForTimeout(300);
  ok(await J((id) => !!VP.db.pega('bens', id).excluido && !VP.db.lista('bens').some(b => b.id === id), idAlvo), 'excluir manda o bem para a Lixeira');
  await ir('#lixeira'); await p.click('[data-restaurar-item]'); await p.waitForTimeout(300);
  ok(await J((id) => !VP.db.pega('bens', id).excluido, idAlvo), 'restaurar da Lixeira');

  // configuração: sem aceite → transferência na hora
  await ir('#configuracoes');
  await p.uncheck('#form-cfg [name=exigeAceiteTransferencia]'); await p.click('[data-salvar-cfg]'); await p.waitForTimeout(200);
  await J((id) => { VP.acoes.transferir([VP.db.pega('bens', id)], () => {}); }, idAlvo);
  await p.selectOption(`${dlg} [name=destinoUnidadeId]`, 'U3'); await botaoDlg('Transferir'); await fecharResultado();
  ok(await J((id) => VP.db.pega('bens', id).unidadeId === 'U3', idAlvo), 'configuração sem aceite: transferência vale na hora');

  // cópia de segurança
  await ir('#configuracoes');
  const [dl3] = await Promise.all([p.waitForEvent('download'), p.click('[data-backup]')]);
  const dump = JSON.parse(fs.readFileSync(await dl3.path(), 'utf8'));
  ok(dump.sistema === 'VitalPat Patrimônio' && dump.dados.bens.length > 100, 'cópia de segurança completa baixada');

  // relatórios: prints
  for (const r of ['estatistico', 'resumo', 'depreciacao', 'seguros', 'despesas', 'frota', 'imoveis', 'incorporacoes']) { await ir('#relatorio/' + r); await p.screenshot({ path: `${O}/rel-${r}.png`, fullPage: true }); }
  await ir('#relatorio/estatistico'); await p.click('[data-imprimir-rel]'); await p.waitForTimeout(200);
  ok(await J(() => document.getElementById('area-impressao').querySelectorAll('.grade-graficos section').length >= 5), 'imprimir relatório leva os gráficos');
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth), 'computador: sem rolagem lateral');

  // celular e modo escuro
  const m = await b.newContext({ ...devices['Pixel 7'], colorScheme: 'dark', locale: 'pt-BR' });
  const mp = await m.newPage(); mp.on('pageerror', e => erros.push('cel: ' + e.message));
  await mp.goto('http://localhost:8765/'); await mp.fill('#usuario', 'patrimonio'); await mp.fill('#senha', '123456'); await mp.click('button[type=submit]');
  await mp.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  await mp.screenshot({ path: O + '/10-celular-escuro-painel.png', fullPage: true });
  ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: painel sem rolagem lateral');
  await mp.evaluate(() => { location.hash = '#relatorio/estatistico'; }); await mp.waitForTimeout(400);
  await mp.screenshot({ path: O + '/11-celular-escuro-relatorio.png', fullPage: true });
  await m.close();

  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTODOS PASSARAM');
  await b.close();
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
