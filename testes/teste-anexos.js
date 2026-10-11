// Anexos do Patrimônio: cadastro com tipo, renomear, tirar/restaurar, .zip com nome plaqueta_descricao_01, importação em lote.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const { execSync } = require('child_process');
const O = __dirname + '/planilhas-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
const D = '/tmp/anx'; fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(D);
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
  let nb = 0; const baixar = async (acao) => { const [d] = await Promise.all([p.waitForEvent('download'), acao()]); const f = `/tmp/anx-baixado-${++nb}-${d.suggestedFilename()}`; await d.saveAs(f); return { nome: d.suggestedFilename(), f }; };
  const lista = (f) => execSync(`python3 -c "import zipfile,sys; print('\\n'.join(zipfile.ZipFile(sys.argv[1]).namelist()))" ${f}`).toString().trim().split('\n');
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const bem = await J(() => { const b = VP.db.lista('bens').find((x) => x.tipo === 'movel' && x.status === 'ativo' && !(x.anexos || []).length); return { id: b.id, pl: b.plaqueta, d: b.descricao, slug: VP.anexos.simplificar(b.descricao) }; });
  console.log('   bem:', JSON.stringify(bem));

  // 1) anexar pela ficha: termo assinado (PDF) e foto
  fs.writeFileSync(D + '/termo.pdf', PDF); fs.writeFileSync(D + '/foto.png', PNG);
  await ir('bem/' + bem.id);
  await p.click('[data-anexo-novo="Termo de responsabilidade assinado"]'); await p.waitForSelector(dlg);
  ok((await p.inputValue(`${dlg} [name="tipoAnexo"]`)) === 'Termo de responsabilidade assinado', 'atalho "+ Termo assinado" já vem com o tipo');
  await p.setInputFiles(`${dlg} [name="arquivos"]`, D + '/termo.pdf'); await botaoDlg('Anexar'); await p.waitForTimeout(600);
  await p.click('[data-anexo-novo=""]'); await p.waitForSelector(dlg);
  await p.setInputFiles(`${dlg} [name="arquivos"]`, D + '/foto.png'); await botaoDlg('Anexar'); await p.waitForTimeout(600);
  let an = await J((id) => VP.db.pega('bens', id).anexos.map((a) => a.tipoAnexo), bem.id);
  ok(an.join('|') === 'Termo de responsabilidade assinado|Foto', 'anexos gravados com o tipo (imagem = Foto sozinho): ' + an);
  // renomear
  const id0 = await J((id) => VP.db.pega('bens', id).anexos[0].id, bem.id);
  await p.click(`[data-anexo-editar="${id0}"]`); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="descricao"]`, 'Termo assinado (teste)'); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('bens', id).anexos[0].descricao === 'Termo assinado (teste)' && VP.eventosDoBem(id).some((e) => e.descricao === 'Anexo renomeado'), bem.id), 'renomear anexo, com registro no histórico');
  // tirar e restaurar
  await p.click(`[data-anexo-tirar="${id0}"]`); await p.waitForSelector(dlg); await botaoDlg('Tirar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('bens', id).anexos[0].excluido === true && VP.db.pega('bens', id).anexos.length === 2, bem.id) && (await p.textContent('#sec-anexos')).includes('retirado'), 'tirar: o anexo fica guardado como retirado (não é apagado)');
  await p.click('#sec-anexos details summary'); await p.click(`[data-anexo-restaurar="${id0}"]`); await p.waitForTimeout(500);
  ok(await J((id) => !VP.db.pega('bens', id).anexos[0].excluido, bem.id), 'restaurar anexo');
  await p.screenshot({ path: O + '/ficha-anexos.png', fullPage: false });
  // .zip da ficha
  const z1 = await baixar(() => p.click('[data-anexo-zip]'));
  const n1 = lista(z1.f);
  ok(n1.includes(`${bem.pl}_${bem.slug}_01.pdf`) && n1.includes(`${bem.pl}_${bem.slug}_02.jpg`) && n1.includes('lista-dos-arquivos.xlsx'), '.zip da ficha com nomes plaqueta_descricao_01: ' + n1.join(', '));

  // 2) exportar em lote (.zip)
  await ir('planilhas/anexos');
  const z2 = await baixar(() => p.click('[data-xa-baixar]'));
  const n2 = lista(z2.f);
  ok(n2.includes(`${bem.pl}_${bem.slug}_01.pdf`), 'exportar anexos em lote (.zip): ' + n2.length + ' arquivos');
  await p.click(`[data-xa-tipo][value="Foto"]`); await p.waitForTimeout(300);
  for (const t of ['Nota fiscal', 'Termo de responsabilidade assinado', 'Laudo', 'Contrato', 'Matrícula', 'Outro']) { if (await p.isChecked(`[data-xa-tipo][value="${t}"]`)) { await p.click(`[data-xa-tipo][value="${t}"]`); await p.waitForTimeout(250); } }
  await p.click(`[data-xa-tipo][value="Foto"]`); await p.waitForTimeout(300);
  const z3 = await baixar(() => p.click('[data-xa-baixar]'));
  ok(lista(z3.f).filter((n) => n.endsWith('.pdf')).length === 0, 'filtro por tipo: só fotos no .zip');

  // 3) importar em lote
  const outro = await J(() => { const b = VP.db.lista('bens').filter((x) => x.tipo === 'movel' && x.status === 'ativo')[3]; return { id: b.id, pl: b.plaqueta }; });
  const nomes = [`${outro.pl}_cadeira_presidente_01.png`, `${outro.pl}_cadeira_presidente_02.png`, `${outro.pl}_cadeira_presidente_03.png`, `${outro.pl}_nota_fiscal_01.pdf`, '999999_nao_existe_01.png', 'sem-padrao.png'];
  for (const n of nomes) fs.writeFileSync(D + '/' + n, n.endsWith('.pdf') ? PDF : PNG);
  execSync(`cd ${D} && python3 -c "import zipfile; z=zipfile.ZipFile('lote.zip','w'); z.write('${outro.pl}_laudo_tecnico_01.pdf') if False else None; z.writestr('pasta/${outro.pl}_laudo_tecnico_01.pdf', open('termo.pdf','rb').read()); z.close()"`);
  await p.setInputFiles('[data-ia-arquivos]', nomes.map((n) => D + '/' + n).concat(D + '/lote.zip')); await p.waitForSelector('#previa-anexos');
  const pv = await J(() => VP.estado.impAnexos.itens.map((x) => `${x.nome}:${x.classe}:${x.tipoAnexo}`));
  console.log('   prévia:', JSON.stringify(pv));
  ok(pv.filter((x) => x.includes(':ok:Foto')).length === 3 && pv.some((x) => /nota_fiscal_01\.pdf:ok:Nota fiscal/.test(x)) && pv.some((x) => /laudo_tecnico_01\.pdf:ok:Laudo/.test(x)), 'prévia: 3 fotos, nota fiscal e laudo (de dentro do .zip) achados pela plaqueta, com o tipo pelo nome');
  ok(pv.some((x) => /999999_nao_existe_01\.png:erro/.test(x)) && pv.some((x) => /sem-padrao\.png:erro/.test(x)), 'plaqueta inexistente e nome fora do padrão: não entram');
  await p.screenshot({ path: O + '/anexos-previa.png', fullPage: true });
  await p.click('[data-ia-aplicar]'); await p.waitForSelector(dlg); await botaoDlg('Importar'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const res = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  ok(/Deram certo ?5/.test(res) && /Não foram feitos ?2/.test(res), 'resultado: 5 anexados, 2 com o motivo');
  await botaoDlg('Fechar');
  ok(await J((id) => VP.db.pega('bens', id).anexos.filter((a) => !a.excluido).length === 5, outro.id), 'os 5 arquivos estão no bem certo');
  // de novo: os mesmos nomes aparecem como "Já existe" e vêm desmarcados
  await p.setInputFiles('[data-ia-arquivos]', [D + '/' + nomes[0]]); await p.waitForSelector('#previa-anexos');
  ok(await J(() => VP.estado.impAnexos.itens[0].classe === 'repetido' && !VP.estado.impAnexos.itens[0].marcado), 'mesmo arquivo de novo: "Já existe", desmarcado');
  await p.click('[data-ia-descartar]'); await p.waitForTimeout(300);
  // desfazer
  await p.click('[data-ia-desfazer]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar');
  ok(await J((id) => VP.db.pega('bens', id).anexos.filter((a) => !a.excluido).length === 0 && VP.db.pega('bens', id).anexos.length === 5, outro.id), 'desfazer: anexos retirados (guardados, não apagados)');
  await p.setViewportSize({ width: 390, height: 800 }); await ir('planilhas/anexos'); await p.waitForTimeout(300);
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: sem rolagem lateral');
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
