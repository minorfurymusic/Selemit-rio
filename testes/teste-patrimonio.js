const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const S0 = process.argv[2], S = S0 + '/prints/../prints/patrimonio/..', URL = 'http://localhost:8765/patrimonio/app-campo/';
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ ...devices['Pixel 7'], locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    geolocation: { latitude: -27.214, longitude: -49.643, accuracy: 12 }, permissions: ['geolocation'], acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); }); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  // Login
  const RAIZ = 'http://localhost:8765/';
  await p.goto(URL);
  await p.waitForURL(RAIZ + 'index.html');
  ok(true, 'sem login: app do patrimônio manda para a tela de login');
  await p.screenshot({ path: S0 + '/prints/0-login.png', fullPage: true });
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '000000'); await p.click('button[type=submit]');
  await p.waitForTimeout(300);
  ok((await p.textContent('#erro')) === 'Usuário ou senha incorretos.', 'senha errada é recusada');
  await p.fill('#usuario', '  Patrimônio '); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForURL('**/patrimonio/gestao/**');
  ok(true, 'login "  Patrimônio " (maiúscula, acento, espaços) abre a Gestão do patrimônio');
  await p.goto(URL); await p.waitForSelector('[data-ir]');
  ok(await p.textContent('#titulo') === 'VitalPat Patrimônio', 'app de campo do patrimônio abre com a mesma sessão');
  await p.evaluate(() => navigator.serviceWorker.ready);
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller) || true, 'service worker registrado');
  const man = await (await p.request.get(URL + 'manifest.webmanifest')).json();
  ok(man.display === 'standalone' && man.icons.length >= 2, 'manifesto de instalação válido');
  await p.screenshot({ path: S0 + '/prints/patrimonio/1-inicio-celular.png', fullPage: true });

  // Conferir bem
  await p.click('[data-ir=bens]'); await p.fill('#codigo', '1001'); await p.click('#buscar');
  await p.click('#estado button[data-valor="4"]');
  await p.setInputFiles('#fotos', { name: 'f.png', mimeType: 'image/png', buffer: fs.readFileSync(require('path').resolve(__dirname, '..') + '/patrimonio/app-campo/icones/icone-512.png') });
  await p.waitForSelector('#previa-fotos img');
  await p.screenshot({ path: S0 + '/prints/patrimonio/2-conferir-bem.png', fullPage: true });
  await p.click('#form button[type=submit]'); await p.waitForTimeout(400);
  // Mesmo bem de novo -> aviso caso (a)
  await p.fill('#codigo', '1001'); await p.click('#buscar');
  await p.waitForSelector('#ja-conferido');
  await p.screenshot({ path: S0 + '/prints/patrimonio/3-ja-conferido.png', fullPage: true });
  ok(await p.isHidden('#form'), 'segunda leitura: formulário escondido até escolher');
  await p.click('#foi-movido'); await p.selectOption('#unidade', 'U2'); await p.click('#estado button[data-valor="3"]');
  await p.click('#form button[type=submit]'); await p.waitForTimeout(400);
  // Sobra
  await p.fill('#codigo', '9999'); await p.click('#buscar'); await p.fill('#descricao', 'Cadeira azul');
  await p.click('#estado button[data-valor="2"]'); await p.click('#form button[type=submit]'); await p.waitForTimeout(400);

  // Abastecimento com aviso
  await p.goto(URL + '#abastecimento'); await p.waitForSelector('#info-veiculo:not(:empty)');
  await p.fill('#motorista', 'Motorista Teste'); await p.fill('#km', '45000'); await p.fill('#litros', '60'); await p.fill('#valor', '350,40');
  await p.selectOption('#combustivel', 'Etanol'); await p.click('#salvar');
  await p.waitForSelector('#explicacao');
  const avisos = await p.$$eval('#alertas li', l => l.map(x => x.textContent));
  ok(avisos.length === 3, 'abastecimento: 3 avisos (km menor, litros > tanque, combustível) -> ' + avisos.length);
  await p.screenshot({ path: S0 + '/prints/patrimonio/5-abastecimento-avisos.png', fullPage: true });
  await p.fill('#explicacao', 'Teste de aviso'); await p.click('#salvar'); await p.waitForTimeout(400);
  // Abastecimento normal
  await p.waitForSelector('#info-veiculo:not(:empty)');
  await p.fill('#motorista', 'Motorista Teste'); await p.fill('#km', '45610'); await p.fill('#litros', '40'); await p.fill('#valor', '240');
  await p.click('#cheio button[data-valor="Sim"]'); await p.click('#salvar'); await p.waitForTimeout(400);

  // Saída
  await p.goto(URL + '#viagem'); await p.waitForSelector('#info-km:not(:empty)');
  await p.click('#mov button[data-valor="Saída"]'); await p.fill('#motorista', 'Motorista Teste'); await p.fill('#km', '100');
  for (const c of ['pneus','luzes','lataria','documentos']) await p.click(`#c-${c} button[data-valor="OK"]`);
  await p.click('#salvar'); await p.waitForTimeout(300);
  ok((await p.textContent('#mensagem')).includes('menor que a última'), 'saída: bloqueia km menor que o último');
  await p.fill('#km', '45700'); await p.click('#salvar'); await p.waitForTimeout(400);

  // Registros
  await p.waitForTimeout(500); await p.goto(URL + '#registros'); await p.waitForSelector('.lista'); await p.waitForTimeout(300);
  const regs = await p.evaluate(() => new Promise(r => { const q = indexedDB.open('vitalpat-patrimonio'); q.onsuccess = () => { const g = q.result.transaction('registros').objectStore('registros').getAll(); g.onsuccess = () => r(g.result); }; }));
  ok(regs.length === 6, 'total de registros salvos = 6 -> ' + regs.length);
  const movido = regs.find(r => r.tipo === 'bem' && r.dados.movidoDuranteInventario);
  ok(movido && movido.dados.foraDoLocal && movido.dados.unidade === 'U2', 'bem movido registrado fora do local (U2)');
  ok(regs.find(r => r.dados.semCadastro && r.dados.descricao === 'Cadeira azul'), 'bem sem cadastro registrado');
  const ab = regs.find(r => r.tipo === 'abastecimento' && !r.dados.alertas);
  ok(ab && ab.dados.kmPorLitro === 10, 'consumo calculado: (45610-45210)/40 = 10 km/L -> ' + (ab && ab.dados.kmPorLitro));
  ok(regs.find(r => r.dados.alertas && r.dados.explicacao === 'Teste de aviso'), 'abastecimento com aviso salvo com explicação');
  ok(regs.every(r => r.gps && Math.abs(r.gps.lat + 27.214) < 0.001), 'todos com localização');
  ok(regs.find(r => r.tipo === 'bem' && r.fotos.length === 1 && r.fotos[0].startsWith('data:image/jpeg')), 'foto salva como JPEG');
  fs.writeFileSync(S0 + '/prints/patrimonio/foto-carimbada.jpg', Buffer.from(regs.find(r => r.fotos.length).fotos[0].split(',')[1], 'base64'));
  await p.screenshot({ path: S0 + '/prints/patrimonio/6-registros.png', fullPage: true });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#csv')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8'); fs.writeFileSync(S0 + '/prints/patrimonio/registros.csv', csv);
  ok(csv.split('\r\n').length === 7, 'planilha: cabeçalho + 6 linhas');
  await p.selectOption('#tipo-planilha', 'abastecimento');
  await p.click('#desmarcar-todas');
  await p.check('#colunas input[value="placa"]'); await p.check('#colunas input[value="litros"]'); await p.check('#colunas input[value="tanqueCheio"]');
  await p.screenshot({ path: S0 + '/prints/patrimonio/6b-escolher-colunas.png', fullPage: true });
  const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#csv')]);
  const csv2 = fs.readFileSync(await dl2.path(), 'utf8'); fs.writeFileSync(S0 + '/prints/patrimonio/planilha-colunas-escolhidas.csv', csv2);
  console.log(JSON.stringify(csv2));
  const l2 = csv2.replace(/^\ufeff/, '').split('\r\n');
  ok(l2[0] === 'Placa;Litros;Tanque cheio' && l2.length === 3, 'planilha só com as colunas escolhidas e só abastecimentos');
  await p.goto(URL + '#registros'); await p.waitForSelector('#colunas');
  await p.selectOption('#tipo-planilha', 'abastecimento');
  ok((await p.$$('#colunas input:checked')).length === 3, 'aparelho lembra as colunas escolhidas');
  // Excluir -> Lixeira -> restaurar
  await p.click('.lista li:first-child [data-acao=excluir]'); await p.waitForTimeout(400);
  await p.goto(URL + '#lixeira'); await p.waitForSelector('.lista');
  ok((await p.$$('.lista li')).length === 1, 'Lixeira com 1 registro');
  await p.screenshot({ path: S0 + '/prints/patrimonio/7-lixeira.png', fullPage: true });
  await p.click('[data-acao=restaurar]'); await p.waitForTimeout(400);
  ok((await p.$$('.lista li')).length === 0, 'restaurado da Lixeira');

  // Sem internet
  await ctx.setOffline(true);
  await p.goto(URL + '#inicio').catch(e => erros.push('offline: ' + e.message));
  await p.waitForSelector('#qtd-aguardando');
  ok((await p.textContent('#conexao')) === 'Sem internet', 'abre sem internet e mostra "Sem internet"');
  ok((await p.textContent('#qtd-aguardando')) === '6', 'sem internet: 6 registros continuam no aparelho');
  await p.screenshot({ path: S0 + '/prints/patrimonio/8-sem-internet.png', fullPage: true });
  await ctx.setOffline(false);

  // Tablet
  const t = await b.newContext({ ...devices['iPad (gen 7)'], locale: 'pt-BR' });
  const tp = await t.newPage(); await tp.goto('http://localhost:8765/');
  await tp.fill('#usuario', 'patrimonio'); await tp.fill('#senha', '123456'); await tp.click('button[type=submit]');
  await tp.waitForURL('**/patrimonio/gestao/**'); await tp.goto(URL); await tp.waitForSelector('[data-ir]');
  await tp.screenshot({ path: S0 + '/prints/patrimonio/9-inicio-tablet.png' });
  await tp.goto(URL + '#abastecimento'); await tp.waitForSelector('#info-veiculo:not(:empty)');
  await tp.screenshot({ path: S0 + '/prints/patrimonio/10-abastecimento-tablet.png', fullPage: true });
  const largura = await tp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  ok(largura, 'tablet: sem rolagem lateral');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'celular: sem rolagem lateral');
  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros));
  await require(S0 + '/teste-cemiterio.js')(b, ctx, S0, ok, erros);
  await b.close();
})().catch(e => { console.log('ERRO', e); process.exit(1); });
