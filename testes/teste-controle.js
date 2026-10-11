// Itens de controle (fora do balancete): cadastro, entregar, baixa, Lixeira, exportar/importar, sugestão no Novo bem.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const { execSync } = require('child_process');
const O = __dirname + '/planilhas-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
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
  let nb = 0; const baixar = async (acao) => { const [d] = await Promise.all([p.waitForEvent('download'), acao()]); const f = `/tmp/ic-baixado-${++nb}-${d.suggestedFilename()}`; await d.saveAs(f); return f; };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  await ir('controle');
  ok((await p.textContent('#titulo-tela')) === 'Itens de controle' && (await p.$$('#tab-controle tbody tr, [data-tabela="controle"] tbody tr')).length >= 0 && (await p.textContent('#conteudo')).includes('C-000001'), 'tela Itens de controle com os exemplos');
  // novo item
  await p.click('[data-novo-controle]'); await p.waitForSelector(dlg);
  const un = await J(() => VP.db.lista('unidades')[2].id);
  await p.fill(`${dlg} [name="descricao"]`, 'Calculadora de mesa (teste)'); await p.fill(`${dlg} [name="quantidade"]`, '5'); await p.fill(`${dlg} [name="valorUnitario"]`, '42,50'); await p.selectOption(`${dlg} [name="unidadeId"]`, un); await p.fill(`${dlg} [name="vidaUtilAnos"]`, '2');
  await botaoDlg('Salvar'); await p.waitForTimeout(600);
  const x = await J(() => VP.db.lista('bensControle').find((i) => i.descricao === 'Calculadora de mesa (teste)'));
  ok(x && x.codigo === 'C-000005' && x.quantidade === 5 && x.valorUnitario === 42.5, 'novo item com código C-000005, sem plaqueta: ' + (x && x.codigo));
  // ficha → entregar → baixa
  await p.click(`[data-ver-controle="${x.id}"]`); await p.waitForSelector(dlg);
  await botaoDlg('Entregar / transferir'); await p.waitForSelector(`${dlg} [name="unidadeId"]`);
  const un2 = await J(() => VP.db.lista('unidades')[3].id);
  await p.selectOption(`${dlg} [name="unidadeId"]`, un2); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J(([id, u2]) => VP.db.pega('bensControle', id).unidadeId === u2 && VP.db.pega('bensControle', id).historico.some((h) => /Entregue/.test(h.descricao)), [x.id, un2]), 'entregar/transferir registra no histórico do item');
  await p.click(`[data-ver-controle="${x.id}"]`); await p.waitForSelector(dlg); await botaoDlg('Dar baixa'); await p.waitForSelector(`${dlg} [name="motivo"]`);
  await p.selectOption(`${dlg} [name="motivo"]`, 'Quebrado sem conserto'); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('bensControle', id).situacao === 'baixado' && !VP.db.pega('bensControle', id).excluido, x.id), 'dar baixa: sai de uso, fica no histórico (não é apagado)');
  // fora do balancete e da depreciação
  ok(await J(() => !VP.db.lista('bens').some((b) => /Calculadora de mesa \(teste\)|Grampeador de mesa/.test(b.descricao)) && VP.calcularFechamento(VP.Plataforma.hoje().slice(0, 7)).every((r) => !String(r.bemId || r.id || '').startsWith('IC'))), 'itens de controle não entram nos bens, no balancete nem no fechamento (depreciação)');
  // excluir → Lixeira → restaurar
  const ic1 = await J(() => VP.db.pega('bensControle', 'IC1').id);
  await J(async () => { const x = VP.db.pega('bensControle', 'IC1'); x.excluido = true; x.excluidoEm = VP.Plataforma.agoraISO(); await VP.db.gravar('bensControle', x); });
  await ir('lixeira');
  ok((await p.textContent('#conteudo')).includes('Item de controle') && (await p.textContent('#conteudo')).includes('C-000001'), 'item excluído aparece na Lixeira');
  await p.click('[data-restaurar-item="bensControle|IC1"]'); await p.waitForTimeout(500);
  ok(await J(() => !VP.db.pega('bensControle', 'IC1').excluido), 'restaurado da Lixeira');
  // exportar itens de controle
  await ir('planilhas'); await p.selectOption('[data-exp="cj"]', 'controle'); await p.waitForTimeout(500);
  const f1 = await baixar(() => p.click('[data-exportar]'));
  ok(execSync(`python3 -c "import openpyxl,sys; ws=openpyxl.load_workbook(sys.argv[1]).worksheets[0]; print(ws['A1'].value, ws.max_row-1)" ${f1}`).toString().trim() === 'Código 4', 'exportar itens de controle em Excel (4 em uso)');
  // importar pelo modelo: aba Itens de controle
  const mod = await baixar(() => p.click('[data-modelo-imp]'));
  fs.writeFileSync('/tmp/ic.py', `import openpyxl,sys
wb=openpyxl.load_workbook(sys.argv[1]); ws=wb['Itens de controle']; h=[c.value for c in ws[1]]; ws.delete_rows(2)
for n in ['Bens móveis','Veículos','Imóveis']: wb[n].delete_rows(2)
def lin(d): ws.append([d.get(x) for x in h])
lin({'Descrição':'Tesoura (teste)','Quantidade':20,'Valor unitário':12.5,'Unidade':${JSON.stringify(await J(() => VP.db.lista('unidades')[0].nome))}})
lin({'Código':'C-000002','Local na unidade':'Pátio (teste)'})
lin({'Código':'C-999999','Descrição':'Não existe'})
lin({'Descrição':'Sem unidade (teste)'})
wb.save('/tmp/ic.xlsx'); print('ok')`);
  execSync(`python3 /tmp/ic.py ${mod}`);
  await ir('planilhas/importar'); await p.setInputFiles('[data-imp-arquivo]', '/tmp/ic.xlsx'); await p.waitForSelector('#depara-imp');
  await p.click('[data-imp-previa]'); await p.waitForSelector('#previa-imp');
  const pv = await J(() => VP.estado.impBens.previa.itens.map((i) => i.classe));
  ok(pv.join() === 'novo,alterado,erro,erro', 'prévia dos itens de controle: novo, alterado (pelo código), código inexistente e sem unidade com erro: ' + pv);
  await p.click('[data-imp-aplicar]'); await p.waitForSelector(dlg); await botaoDlg('Importar'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar');
  ok(await J(() => VP.db.lista('bensControle').some((i) => i.descricao === 'Tesoura (teste)' && i.quantidade === 20) && VP.db.pega('bensControle', 'IC2').localizacao === 'Pátio (teste)'), 'importado: item novo e item atualizado');
  await p.click('[data-imp-desfazer]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar');
  ok(await J(() => !VP.db.lista('bensControle').some((i) => i.descricao === 'Tesoura (teste)') && VP.db.pega('bensControle', 'IC2').localizacao === 'Corredores'), 'desfazer a importação dos itens de controle');
  // sugestão no Novo bem
  await ir('novo-bem/movel'); await p.fill('#form-novo [name="valor"]', '150'); await p.dispatchEvent('#form-novo [name="valor"]', 'change'); await p.waitForTimeout(400);
  ok(!!(await p.$('#dica-controle')), 'Novo bem com valor abaixo de R$ 300: sugere cadastrar como item de controle (não obriga)');
  await p.fill('#form-novo [name="valor"]', '1500'); await p.dispatchEvent('#form-novo [name="valor"]', 'change'); await p.waitForTimeout(300);
  ok(!(await p.$('#dica-controle')), 'valor acima do limite: sem sugestão');
  await ir('controle'); await p.screenshot({ path: O + '/controle.png', fullPage: true });
  await p.setViewportSize({ width: 390, height: 800 }); await ir('controle'); await p.waitForTimeout(300);
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: sem rolagem lateral');
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
