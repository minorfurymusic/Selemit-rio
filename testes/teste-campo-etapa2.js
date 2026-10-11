// App de campo do cemitério (etapa 2), modo demonstração: aviso de problema, ordem feita, sem internet,
// cópia completa → importada na Gestão → conferida.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/cem-prints';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const PNG = { name: 'f.png', mimeType: 'image/png', buffer: fs.readFileSync(require('path').resolve(__dirname, '..') + '/cemiterio/app-campo/icones/icone-192.png') };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  const URL = 'http://localhost:8765/cemiterio/app-campo/';
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  await p.goto(URL); await p.waitForSelector('[data-ir]');
  await p.evaluate(() => navigator.serviceWorker.ready);
  ok((await p.$$('[data-ir]')).length === 5, 'tela inicial com 5 opções');
  await p.screenshot({ path: O + '/app-inicio.png', fullPage: true });

  // Sem internet a partir daqui
  await p.reload(); await p.waitForSelector('[data-ir]');
  await ctx.setOffline(true);

  // Aviso de problema
  await p.click('[data-ir="ocorrencia"]'); await p.waitForSelector('#desc');
  await p.fill('#codigo', 'q1-a01-002'); await p.dispatchEvent('#codigo', 'change');
  ok((await p.textContent('#achado')).includes('Aléia 01 · Nº 002'), 'código com zeros diferentes acha o túmulo sem internet');
  await p.click('#salvar'); await p.waitForTimeout(200);
  ok((await p.textContent('#mensagem')).includes('Escolha'), 'aviso sem tipo é barrado');
  await p.click('#tipo-oc button[data-valor="Acidente ou risco"]'); await p.fill('#desc', 'Lápide caída sobre o caminho');
  await p.setInputFiles('#fotos', PNG); await p.waitForSelector('#previa-fotos img');
  await p.screenshot({ path: O + '/app-aviso.png', fullPage: true });
  await p.click('#salvar'); await p.waitForTimeout(400);

  // Ordem de serviço feita
  await p.goto(URL + '#ordens'); await p.waitForSelector('[data-ordem]');
  ok((await p.$$('[data-ordem]')).length === 2, 'duas ordens de exemplo na lista');
  await p.click('[data-ordem="demo-os-2"]'); await p.waitForSelector('#nota');
  await p.fill('#nota', 'Tampa isolada e trocada'); await p.click('#salvar'); await p.waitForTimeout(200);
  ok((await p.textContent('#mensagem')).includes('foto'), 'ordem feita exige foto');
  await p.setInputFiles('#fotos', PNG); await p.waitForSelector('#previa-fotos img');
  await p.click('#salvar'); await p.waitForTimeout(400);
  ok((await p.textContent('#tela')).includes('Marcada como feita neste aparelho'), 'ordem aparece como feita neste aparelho');
  await p.screenshot({ path: O + '/app-ordens.png', fullPage: true });

  // Registros e cópia completa
  await p.goto(URL + '#registros'); await p.waitForSelector('.lista');
  ok((await p.textContent('.contador')) === '2', '2 registros aguardando');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#json')]);
  const regs = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(regs.length === 2 && regs.every((r) => r.fotos.length === 1), 'cópia completa com os 2 registros e fotos');
  fs.writeFileSync('/tmp/copia-app.json', JSON.stringify(regs));
  await ctx.setOffline(false);

  // Gestão: importa e confere
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:8765/cemiterio/gestao/#vistorias/recebidos');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  await p.setInputFiles('[data-arquivo-app]', '/tmp/copia-app.json');
  await p.waitForSelector('dialog.janela[open] .resultado-numeros'); await p.click('dialog.janela[open] footer button:has-text("Fechar")');
  await p.click('#tab-recebidos [data-marcar-todos]'); await p.click('#barra-rec [data-confirmar-rec]');
  await p.waitForSelector('dialog.janela[open] .resultado-numeros');
  const txt = await p.textContent('dialog.janela[open]');
  console.log('   TEXTO:', txt.replace(/\s+/g, ' ').slice(0, 300));
  ok(/Deram certo\s*1/.test(txt) && txt.includes('Ordem de serviço não encontrada'), 'aviso vira ordem; a ordem fictícia do app (que não existe nesta Gestão) é recusada com o motivo');
  await p.screenshot({ path: O + '/gestao-conferencia-app.png' });
  const o = await p.evaluate(() => VP.db.lista('ordensServico').find((x) => x.origem === 'campo'));
  ok(o && o.tipo === 'acidente' && o.prioridade === 'urgente' && o.fotos.length === 1, 'ordem urgente criada a partir do aviso, com a foto');
  ok(erros.length === 0, 'sem erros: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
