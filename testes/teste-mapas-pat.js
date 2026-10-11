// Etapas 7 e 8 do patrimônio: mapa dos imóveis (Leaflet), localização, KML e relatório com fotos e mapa — demonstração.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/mapas-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  let tiles = 0;
  await ctx.route(/tile\.openstreetmap\.org/, (r) => { tiles++; r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(600); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });

  const n = await J(() => ({ com: VP.imoveis.lista().filter(VP.mapas.temCoord).length, im: VP.imoveis.lista().filter((b) => b.tipo === 'imovel').length }));
  ok(n.com === 6 && n.im === 6, 'dados de exemplo: os 6 imóveis com localização fictícia: ' + JSON.stringify(n));
  await ir('imoveis/mapa'); await p.waitForSelector('#mapa-imoveis.leaflet-container', { state: 'attached' }); await p.waitForTimeout(800);
  ok(!!(await p.$('.abas a[href="#imoveis/mapa"].ativa')), 'aba Mapa em Bens imóveis');
  ok((await J(() => VP.mapas.marcas.size)) === 6 && tiles > 0, '6 pontos no mapa e fundo de ruas pedido (' + tiles + ' imagens)');
  ok((await p.textContent('#conteudo')).includes('Sem localização (3)'), 'infraestrutura sem localização listada à parte');
  await p.screenshot({ path: O + '/pat-mapa-imoveis.png' });
  // KML
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-kml-imo]')]);
  const kml = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename().endsWith('.kml') && (kml.match(/<Placemark>/g) || []).length === 6 && /<coordinates>-49\.\d+,-27\.\d+,0<\/coordinates>/.test(kml), 'KML para o Google Earth com 6 pontos (longitude, latitude)');
  // informar localização pela ficha
  const id = await J(() => VP.imoveis.lista().find((b) => b.tipo === 'imovel').id);
  await ir('bem/' + id);
  await p.click('[data-local-imovel]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name=lat]`, '-49,6'); await p.fill(`${dlg} [name=lon]`, '-27,2'); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/fora do Brasil/.test(await p.textContent(`${dlg} .erro-form`)), 'latitude e longitude trocadas são recusadas');
  await p.fill(`${dlg} [name=lat]`, '-27,2001'); await p.fill(`${dlg} [name=lon]`, '-49,6301'); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const g = await J((id) => ({ i: VP.db.pega('bens', id).imovel, ev: VP.db.lista('eventos').filter((e) => e.bemId === id && /Localização/.test(e.descricao)).length }), id);
  ok(g.i.lat === -27.2001 && g.i.lon === -49.6301 && g.ev === 1, 'localização salva com registro no histórico');
  ok((await p.textContent('#conteudo')).includes('-27.2001'), 'ficha mostra a localização');
  // registros do app de campo com GPS
  await J(async () => { await VP.db.gravar('registrosCampo', { id: 'RC-MAPA', tipo: 'vistoria', gps: { lat: -27.21, lon: -49.64, precisao: 8 }, criadoEm: new Date().toISOString() }); });
  await ir('imoveis/mapa'); await p.check('[data-campo-imo]'); await p.waitForTimeout(700);
  ok((await J(() => VP.mapas.ultimoMapa && document.querySelectorAll('#mapa-imoveis').length)) === 1, 'mostrar registros do aplicativo com GPS sem erro');
  // relatório com fotos
  await ir('relatorios');
  ok(!!(await p.$('a[href="#relatorio-fotos"]')), 'relatórios: cartão "com fotos e mapa"');
  const PIX = 'data:image/png;base64,' + PNG.toString('base64');
  await J(async (pix) => { const bs = VP.db.lista('bens').filter((b) => b.tipo === 'movel').slice(0, 3); bs.forEach((b) => { b.fotos = [{ id: 'x', dataURL: pix, data: VP.Plataforma.hoje() }]; }); await VP.db.gravarVarias({ bens: bs }); const im = VP.imoveis.lista().find((b) => b.tipo === 'imovel'); im.fotos = [{ id: 'y', dataURL: pix, data: VP.Plataforma.hoje() }]; await VP.db.gravar('bens', im); }, PIX);
  await ir('relatorio-fotos');
  let c = await p.textContent('#corpo-relatorio');
  ok(c.includes('3 bem(ns)') && (await p.$$('#corpo-relatorio .fotos-rel img')).length === 3, 'bens com foto: 3, com as fotos');
  await p.uncheck('[data-rfp="soComFoto"]'); await p.waitForTimeout(500);
  const nb = await J(() => VP.db.lista('bens').filter((b) => b.status !== 'baixado' && !['imovel', 'infraestrutura'].includes(b.tipo)).length);
  ok((await p.textContent('#corpo-relatorio')).includes(nb + ' bem(ns)') && (await p.$$('#corpo-relatorio .ficha-foto-rel')).length === Math.min(nb, 200), 'sem filtro "só com foto": todos os ' + nb + ' bens (limite de 200 por vez)');
  await ir('relatorio-fotos/imoveis');
  ok((await J(() => document.querySelectorAll('#corpo-relatorio svg.mapa-pontos circle').length)) === 6 && (await p.$$('#corpo-relatorio .fotos-rel img')).length === 1, 'imóveis: mapa desenhado com 6 pontos e a foto');
  await p.screenshot({ path: O + '/pat-relatorio-imoveis.png', fullPage: true });
  await p.click('[data-imprimir-rf]').catch(() => {}); await p.waitForTimeout(300);
  ok(!!(await p.$('#area-impressao svg.mapa-pontos')), 'imprimir leva o mapa junto');
  await p.setViewportSize({ width: 390, height: 800 }); await ir('imoveis/mapa'); await p.waitForTimeout(500);
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: sem rolagem lateral');
  await p.screenshot({ path: O + '/pat-mapa-celular.png' });
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
