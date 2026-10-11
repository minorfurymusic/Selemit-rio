// Etapas 7 e 8 do cemitério: mapa sobre imagem (Leaflet) e relatório fotográfico com mapa — demonstração.
// O servidor de mapas do OpenStreetMap é trocado por uma imagem em branco (o teste não depende de internet).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/mapas-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  let tiles = 0;
  await ctx.route(/tile\.openstreetmap\.org/, (r) => { tiles++; r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(600); };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });

  // sem coordenadas: aviso, sem mapa
  await ir('mapa/real');
  ok((await p.textContent('#conteudo')).includes('Ainda não há túmulos com coordenada'), 'sem coordenada: avisa e não desenha mapa vazio');
  ok(!!(await p.$('.abas a[href="#mapa/real"].ativa')), 'aba "Sobre a imagem" ativa');
  await ir('mapa');
  ok(!!(await p.$('.abas a[href="#mapa"].ativa')) && !!(await p.$('.cova')), 'mapa por posição continua igual, com as abas');

  // coordenadas fictícias para 30 túmulos da Quadra 1 + contorno da quadra + 1 foto
  const PIX = 'data:image/png;base64,' + PNG.toString('base64');
  const r = await J(async (pix) => {
    const ts = VP.ordenarTumulos(VP.db.lista('tumulos')).slice(0, 30);
    ts.forEach((t, i) => { t.geo = { lat: -27.2145 - Math.floor(i / 10) * 0.00004, lon: -49.6432 + (i % 10) * 0.00003, precisao: 0.03, fonte: 'levantamento', data: VP.Plataforma.hoje(), poligono: null }; });
    ts[0].fotos = [{ id: 'f1', dataURL: pix, data: VP.Plataforma.hoje() }];
    const q = VP.db.pega('quadras', ts[0].quadraId);
    q.geo = { poligono: [[-27.2144, -49.6433], [-27.2144, -49.6428], [-27.2147, -49.6428], [-27.2147, -49.6433]] };
    await VP.db.gravarVarias({ tumulos: ts, quadras: [q] });
    return { primeiro: ts[0].id, codigo: VP.codigoQR(ts[0]), quinto: ts[4].id };
  }, PIX);
  await ir('mapa/real'); await p.waitForSelector('#mapa-leaflet.leaflet-container', { state: 'attached' }); await p.waitForTimeout(800);
  const m = await J(() => ({ marcas: VP.mapaReal.marcas.size, z: VP.mapaReal.ultimoMapa.getZoom(), tiles: document.querySelectorAll('#mapa-leaflet .leaflet-tile').length, poligonos: document.querySelectorAll('#mapa-leaflet path.leaflet-interactive').length || document.querySelectorAll('#mapa-leaflet canvas').length }));
  ok(m.marcas === 30, '30 pontos no mapa: ' + JSON.stringify(m));
  ok(m.z >= 18, 'mapa ajustado aos pontos (zoom ' + m.z + ')');
  ok(tiles > 0 && m.tiles > 0, 'fundo de ruas pedido ao servidor de mapas (' + tiles + ' imagens)');
  ok((await p.textContent('#conteudo')).includes('30 de '), 'texto mostra quantos têm coordenada');
  await p.screenshot({ path: O + '/cem-mapa-real.png' });
  // achar por código abre o balão do túmulo
  await p.fill('[data-achar-real]', r.codigo); await p.press('[data-achar-real]', 'Enter'); await p.waitForTimeout(800);
  const pop = await p.textContent('.leaflet-popup-content').catch(() => '');
  ok(pop.includes(r.codigo) && pop.includes('Abrir ficha') && pop.includes('Google Maps'), 'achar pelo código abre o balão com ficha e Google Maps');
  await p.screenshot({ path: O + '/cem-mapa-achar.png' });
  await p.click('.leaflet-popup-content a[href^="#tumulo/"]'); await p.waitForTimeout(600);
  ok((await J(() => location.hash)) === '#tumulo/' + r.primeiro, 'link do balão abre a ficha');
  // colorir por situação muda as cores sem erro
  await ir('mapa/real'); await p.selectOption('[data-modo-real]', 'situacao'); await p.waitForTimeout(600);
  ok((await p.textContent('.legenda')).includes('Regular'), 'colorir por situação: legenda de situação');
  // sem mapa de ruas: não pede imagens
  const t0 = tiles; await p.uncheck('[data-ruas]'); await p.waitForTimeout(800);
  ok(tiles === t0 && (await J(() => document.querySelectorAll('#mapa-leaflet .leaflet-tile').length)) === 0 && (await J(() => VP.mapaReal.marcas.size)) === 30, 'sem internet (ruas desligado) os pontos aparecem mesmo assim');
  // foto aérea cadastrada vira fundo
  await J(async (pix) => { const c = VP.db.lista('cemiterios')[0]; c.geo = Object.assign({}, c.geo, { ortofoto: { url: pix, sul: -27.2150, norte: -27.2140, oeste: -49.6435, leste: -49.6425 } }); await VP.db.gravar('cemiterios', c); }, PIX);
  await J(() => VP.app.render()); await p.waitForTimeout(600);
  ok(!!(await p.$('#mapa-leaflet img.leaflet-image-layer')) && (await p.textContent('#conteudo')).includes('Fundo: foto aérea'), 'foto aérea do cadastro aparece como fundo');

  // ---- relatório fotográfico com mapa (etapa 8)
  await ir('relatorios');
  ok(!!(await p.$('a[href="#relatorio/fotografico"]')) && !!(await p.$('.galeria a[href="#mapa/real"]')), 'relatórios: cartões novos');
  await ir('relatorio/fotografico');
  let c = await p.textContent('#corpo-relatorio');
  ok(c.includes('1 túmulo(s)') && !!(await p.$('#corpo-relatorio svg.mapa-pontos circle')) && !!(await p.$('#corpo-relatorio .fotos-rel img')), 'só com foto: 1 túmulo, com mapa desenhado e a foto');
  await p.uncheck('[data-rf="soComFoto"]'); await p.waitForTimeout(500);
  const pts = await J(() => document.querySelectorAll('#corpo-relatorio svg.mapa-pontos circle').length);
  c = await p.textContent('#corpo-relatorio');
  ok(pts === 30 && !!(await p.$('#corpo-relatorio svg.mapa-pontos polygon')), 'todos: 30 pontos e o contorno da quadra no mapa desenhado: ' + pts);
  ok(c.includes('mostrando os primeiros 150'), 'muitos túmulos: avisa que mostra os 150 primeiros');
  await p.screenshot({ path: O + '/cem-relatorio-fotos.png', fullPage: false });
  await p.click('[data-imprimir]').catch(() => {}); await p.waitForTimeout(300);
  ok(!!(await p.$('#area-impressao svg.mapa-pontos')), 'imprimir leva o mapa junto');
  // mapa desenhado sem coordenada
  ok(await J(() => VP.graficos.mapaPontos([]).includes('Sem coordenadas')), 'mapa desenhado sem pontos: mensagem simples');
  // tela no celular sem rolagem lateral
  await p.setViewportSize({ width: 390, height: 800 }); await ir('mapa/real'); await p.waitForTimeout(500);
  ok(await J(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'celular: sem rolagem lateral');
  await p.screenshot({ path: O + '/cem-mapa-celular.png' });
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
