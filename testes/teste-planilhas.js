// Exportar e importar (Patrimônio): Excel nas listas, tela central, modelo, importação com prévia e desfazer.
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
  let nb = 0; const baixar = async (acao) => { const [d] = await Promise.all([p.waitForEvent('download'), acao()]); const f = `/tmp/baixado-${++nb}-${d.suggestedFilename()}`; await d.saveAs(f); return { nome: d.suggestedFilename(), f }; };
  const py = (f, code) => { try { return execSync(`python3 -c "import openpyxl,sys; wb=openpyxl.load_workbook(sys.argv[1]); ${code}" ${f}`, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim(); } catch (e) { const m = e.stderr.toString().trim().split("\n").slice(-2).join(" / "); fs.copyFileSync(f, "/tmp/ruim.xlsx"); return "ERRO-PY: " + m; } };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });

  // 1) "Baixar planilha" de uma lista sai em Excel
  await ir('bens/moveis'); await p.click('[data-planilha]'); await p.waitForSelector(dlg);
  ok((await p.inputValue(`${dlg} [data-formato]`)) === 'xlsx', 'Baixar planilha: Excel é o formato padrão');
  const x1 = await baixar(() => p.click(`${dlg} footer button:has-text("Baixar")`));
  ok(x1.nome.endsWith('.xlsx'), 'lista de bens baixada em .xlsx: ' + x1.nome);
  const n1 = await J(() => VP.db.lista('bens').filter((b) => ['movel', 'intangivel'].includes(b.tipo) && b.status !== 'baixado').length);
  ok(py(x1.f, 'ws=wb.worksheets[0]; print(ws.max_row-1)') === String(n1), 'o Excel abre no programa de planilhas (openpyxl) e tem todas as linhas da lista (sem os baixados, como na tela): ' + n1);

  // 2) tela central: exportar com filtro e uma aba por unidade
  await ir('planilhas');
  ok((await p.textContent('#titulo-tela')) === 'Exportar e importar' && !!(await p.$('#menu a[data-rota="planilhas"].ativo')), 'tela Exportar e importar no menu');
  await p.check('[data-exp="porUnidade"]'); await p.waitForTimeout(400);
  const x2 = await baixar(() => p.click('[data-exportar]'));
  const nUn = await J(() => new Set(VP.db.lista('bens').filter((b) => ['movel', 'intangivel'].includes(b.tipo) && b.status !== 'baixado').map((b) => b.unidadeId)).size);
  ok(py(x2.f, 'print(len(wb.worksheets))') === String(nUn), 'uma aba por unidade: ' + nUn + ' abas');
  const un = await J(() => VP.db.lista('unidades')[0].id);
  await p.selectOption('[data-exp="unidadeId"]', un); await p.uncheck('[data-exp="porUnidade"]'); await p.waitForTimeout(400);
  await p.click('[data-exp-nenhuma]'); for (const k of ['plaqueta', 'descricao', 'estado']) await p.check(`#exp-colunas input[value="${k}"]`);
  const x3 = await baixar(() => p.click('[data-exportar]'));
  const nU = await J((id) => VP.db.lista('bens').filter((b) => ['movel', 'intangivel'].includes(b.tipo) && b.status !== 'baixado' && b.unidadeId === id).length, un);
  ok(py(x3.f, "ws=wb.worksheets[0]; print(ws.max_column, ws.max_row-1, ws['A1'].value, ws['A1'].font.b)") === `3 ${nU} Plaqueta True`, 'filtro por unidade e só 3 colunas escolhidas (cabeçalho em negrito)');
  await p.screenshot({ path: O + '/exportar.png', fullPage: true });

  // 3) modelo para importação
  const mod = await baixar(() => p.click('[data-modelo-imp]'));
  ok(py(mod.f, "print('|'.join(wb.sheetnames))").startsWith('Bens móveis|Veículos|Imóveis') && py(mod.f, "print('Instruções' in wb.sheetnames and 'Listas' in wb.sheetnames)") === 'True', 'modelo com abas Bens móveis, Veículos, Imóveis, Instruções e Listas');
  // preenche o modelo como uma pessoa faria no Excel (openpyxl), com data digitada como data
  const alvo = await J(() => { const b = VP.db.lista('bens').find((x) => x.tipo === 'movel' && x.status === 'ativo'); return { pl: b.plaqueta, un: VP.nome('unidades', b.unidadeId), estado: b.estado, valor: VP.eventosDoBem(b.id).find((e) => e.tipo === 'incorporacao').valor, id: b.id, desc: b.descricao }; });
  const cl = await J(() => VP.caminhoClassificacao(VP.db.lista('classificacoes').find((c) => c.nivel !== 'grupo' && (VP.dadosDaClassificacao(c.id).tipoBem || 'movel') === 'movel')));
  const unNome = await J(() => VP.db.lista('unidades')[1].nome);
  const clV = await J(() => VP.caminhoClassificacao(VP.db.lista('classificacoes').find((c) => c.nivel !== 'grupo' && VP.dadosDaClassificacao(c.id).tipoBem === 'veiculo')));
  const clI = await J(() => VP.caminhoClassificacao(VP.db.lista('classificacoes').find((c) => c.nivel !== 'grupo' && VP.dadosDaClassificacao(c.id).tipoBem === 'imovel')));
  const novoEstado = alvo.estado === 2 ? 'Bom' : 'Ruim';
  const preencher = `
import datetime
ws=wb['Bens móveis']; h=[c.value for c in ws[1]]; ws.delete_rows(2)
def lin(d): ws.append([d.get(x,None) for x in h])
lin({'Descrição':'Mesa de reunião (teste)','Classificação':${JSON.stringify(cl)},'Unidade':${JSON.stringify(unNome)},'Data de aquisição':datetime.date(2024,3,15),'Valor de aquisição':1890.5,'Estado':'Novo','Plaqueta':'990001'})
lin({'Descrição':'Sem classificação (teste)','Unidade':${JSON.stringify(unNome)},'Data de aquisição':'10/01/2024','Valor de aquisição':100})
lin({'Plaqueta':${JSON.stringify(alvo.pl)},'Estado':'${novoEstado}','Local na unidade':'Sala 99 (teste)','Valor de aquisição':${alvo.valor + 1000}})
lin({'Plaqueta':'990001','Descrição':'Repetida (teste)','Classificação':${JSON.stringify(cl)},'Data de aquisição':'01/02/2024','Valor de aquisição':5})
lin({'Descrição':'Data errada (teste)','Classificação':${JSON.stringify(cl)},'Data de aquisição':'31/02/2024','Valor de aquisição':'abc'})
wv=wb['Veículos']; wv.delete_rows(2); hv=[c.value for c in wv[1]]
wv.append([{'Descrição':'Caminhonete (teste)','Classificação':${JSON.stringify(clV)},'Unidade':${JSON.stringify(unNome)},'Data de aquisição':'05/06/2023','Valor de aquisição':185000,'Placa':'TST1A23','Combustível':'Diesel','Ano/modelo':'2023/2023'}.get(x) for x in hv])
wb['Itens de controle'].delete_rows(2)
wi=wb['Imóveis']; wi.delete_rows(2); hi=[c.value for c in wi[1]]
wi.append([{'Descrição':'Terreno (teste)','Classificação':${JSON.stringify(clI)},'Unidade':${JSON.stringify(unNome)},'Data de aquisição':'01/01/2010','Valor de aquisição':90000,'Matrícula':'99.999','Situação do registro':'Em regularização','O que impede o registro':'Falta abrir matrícula (teste)','Área do terreno (m²)':'1.200,5','Latitude':'-27,21','Longitude':'-49,64','Afetado':'Não'}.get(x) for x in hi])
wb.save('/tmp/modelo-preenchido.xlsx'); print('ok')`;
  fs.writeFileSync('/tmp/preenche.py', 'import openpyxl,sys\nwb=openpyxl.load_workbook(sys.argv[1])\n' + preencher);
  ok(execSync(`python3 /tmp/preenche.py ${mod.f}`).toString().trim() === 'ok', 'modelo preenchido fora do sistema (como no Excel)');

  // 4) importar: De/Para, prévia
  await ir('planilhas/importar');
  await p.setInputFiles('[data-imp-arquivo]', '/tmp/modelo-preenchido.xlsx'); await p.waitForSelector('#depara-imp');
  const mapa = await J(() => VP.estado.impBens.abas.find((a) => a.nome === 'Bens móveis').mapa);
  ok(mapa.filter(Boolean).length >= 15 && mapa[0] === 'plaqueta', 'colunas do modelo ligadas sozinhas pelo título (' + mapa.filter(Boolean).length + ')');
  await p.screenshot({ path: O + '/depara.png', fullPage: true });
  await p.click('[data-imp-previa]'); await p.waitForSelector('#previa-imp');
  const pv = await J(() => VP.estado.impBens.previa.itens.map((x) => ({ c: x.classe, e: x.erros.join(';'), a: x.avisos.join(';'), m: x.mudancas.map((m) => m.k).join(',') })));
  console.log('   prévia:', JSON.stringify(pv));
  ok(pv[0].c === 'novo', 'linha nova válida = Novo');
  ok(pv[1].c === 'novo', 'sem classificação: entra com a classificação padrão do arquivo ("A classificar", sem depreciação)');
  ok(pv[2].c === 'alterado' && pv[2].m === 'localizacao,estado' && /reavaliação/.test(pv[2].a), 'bem existente: estado e local alterados; valor não muda (aviso de reavaliação)');
  ok(pv[3].c === 'erro' && /repetida no arquivo/.test(pv[3].e), 'plaqueta repetida no arquivo = Erro');
  ok(pv[4].c === 'erro' && /não é uma data/.test(pv[4].e) && /não é um número/.test(pv[4].e), 'data 31/02 e valor "abc" recusados');
  ok(pv[5].c === 'novo' && pv[6].c === 'novo', 'aba Veículos e aba Imóveis: linhas novas válidas: ' + JSON.stringify([pv[5], pv[6]]));
  await p.screenshot({ path: O + '/previa.png', fullPage: true });
  await p.click('[data-imp-aplicar]'); await p.waitForSelector(dlg); await p.click(`${dlg} footer button:has-text("Importar")`);
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  const res = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  ok(/Deram certo ?5/.test(res) && /Não foram feitos ?2/.test(res), 'resultado: 5 feitos (2 móveis novos, 1 alterado, veículo, imóvel), 2 com o motivo');
  await p.screenshot({ path: O + '/resultado.png' });
  await p.click(`${dlg} footer button:has-text("Fechar")`);
  const dep = await J(([id]) => { const n = VP.db.lista('bens').find((b) => b.plaqueta === '990001'); const a = VP.db.pega('bens', id); return { novo: n && n.descricao, data: n && n.dataAquisicao, cod: n && n.codigo, est: a.estado, loc: a.localizacao, hist: VP.eventosDoBem(id).some((e) => /importação de planilha/.test(e.descricao) && e.dados.mudancas?.length === 2) }; }, [alvo.id]);
  ok(dep.novo === 'Mesa de reunião (teste)' && dep.data === '2024-03-15' && dep.cod > 0, 'bem novo criado com a plaqueta 990001 e a data digitada no Excel');
  ok(dep.loc === 'Sala 99 (teste)' && dep.hist, 'bem existente atualizado, com antes/depois no histórico');
  const vi = await J(() => { const v = VP.db.lista('bens').find((b) => b.descricao === 'Caminhonete (teste)'); const i = VP.db.lista('bens').find((b) => b.descricao === 'Terreno (teste)'); return { vt: v?.tipo, placa: v?.veiculo?.placa, comb: v?.veiculo?.combustivel, it: i?.tipo, mat: i?.imovel?.matricula, sit: i?.imovel?.situacaoRegistro, area: i?.imovel?.areaTerreno, lat: i?.imovel?.lat, af: i?.imovel?.afetado, mapa: VP.mapas.temCoord(i) }; });
  ok(vi.vt === 'veiculo' && vi.placa === 'TST1A23' && vi.comb === 'Diesel', 'veículo importado com placa e combustível: ' + JSON.stringify(vi));
  ok(vi.it === 'imovel' && vi.mat === '99.999' && vi.sit === 'Em regularização' && vi.area === 1200.5 && vi.lat === -27.21 && vi.af === false && vi.mapa, 'imóvel importado com matrícula, situação, área, coordenada (aparece no mapa) e afetado = Não');
  // 5) importar o mesmo arquivo de novo: a linha atualizada fica "Igual"
  await p.setInputFiles('[data-imp-arquivo]', '/tmp/modelo-preenchido.xlsx'); await p.waitForSelector('#depara-imp'); await p.click('[data-imp-previa]'); await p.waitForSelector('#previa-imp');
  const pv2 = await J(() => VP.estado.impBens.previa.itens.map((x) => x.classe));
  ok(pv2[0] === 'alterado' || pv2[0] === 'igual', 'de novo: o bem 990001 agora existe (não duplica): ' + pv2[0]);
  ok(pv2[2] === 'igual', 'de novo: o bem já atualizado fica Igual');
  await p.click('[data-imp-descartar]'); await p.waitForTimeout(300);
  // 6) desfazer
  await p.click('[data-imp-desfazer]'); await p.waitForSelector(dlg); await p.click(`${dlg} footer button:has-text("Desfazer")`); await p.waitForSelector(`${dlg} .resultado-numeros`); await p.click(`${dlg} footer button:has-text("Fechar")`);
  const dz = await J(([id]) => ({ novo: VP.db.lista('bens').some((b) => b.plaqueta === '990001'), lix: VP.db.lista('bens', true).some((b) => b.plaqueta === '990001' && b.excluido), loc: VP.db.pega('bens', id).localizacao }), [alvo.id]);
  ok(!dz.novo && dz.lix && dz.loc !== 'Sala 99 (teste)' && await J(() => !VP.db.lista('bens').some((b) => /Caminhonete \(teste\)|Terreno \(teste\)|Sem classificação \(teste\)/.test(b.descricao))), 'desfazer: os novos vão para a Lixeira e o alterado volta ao valor anterior');
  // 7) papel consulta não vê o botão de importar (CSS/estado) — checado pela função pode()
  // 8) celular
  await p.setViewportSize({ width: 390, height: 800 }); await ir('planilhas/importar'); await p.waitForTimeout(300);
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: sem rolagem lateral');
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
