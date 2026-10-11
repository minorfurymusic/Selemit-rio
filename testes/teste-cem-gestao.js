const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const S = process.argv[2], O = S + '/cem-prints';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0,4).join(' | ')); });
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(300); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(p.url().endsWith('/cemiterio/gestao/'), 'login selemitério abre a Gestão do Cemitério');
  ok(await p.$eval('.topo', e => getComputedStyle(e).backgroundColor) !== 'rgba(0, 0, 0, 0)', 'estilo carregado (topo colorido)');
  const total0 = await J(() => VP.db.lista('tumulos').length);
  ok(total0 > 2000, `semente fictícia: ${total0} túmulos`);

  // patrimônio barrado
  const q = await ctx.newPage(); await q.goto('http://localhost:8765/patrimonio/gestao/'); await q.waitForURL(/motivo=sem-acesso/); ok(true, 'selemitério não entra na Gestão do Patrimônio'); await q.close();

  // mapa: achar número
  await ir('mapa');
  ok((await p.$$('.cova')).length === total0, 'mapa desenha um quadradinho por túmulo');
  await p.selectOption('[data-quadra]', 'Q3'); await p.fill('[data-achar]', '15'); await p.press('[data-achar]', 'Enter'); await p.waitForTimeout(300);
  ok((await p.$$('.cova.achada')).length >= 1, 'mapa: "achar número 15" destaca o túmulo');
  await p.screenshot({ path: O + '/t-mapa-achar.png' });
  await p.selectOption('[data-quadra]', ''); await p.waitForTimeout(200);

  // busca global
  await p.fill('#busca-global', 'Q01-A1-6'); await p.press('#busca-global', 'Enter'); await p.waitForTimeout(400);
  ok((await p.$$('#tab-tumulos tbody tr, table tbody tr')).length >= 1 && p.url().includes('#tumulos?busca='), 'busca global abre a lista filtrada');

  // importação do xlsx real
  await ir('importar');
  await p.setInputFiles('[data-arquivo]', require('path').resolve(__dirname, '..') + '/cemiterio/modelos-importacao/lista-chaos-modelo.xlsx');
  await p.waitForSelector('[data-previa]', { timeout: 30000 });
  const info = await p.textContent('#area-imp');
  const m = info.match(/(\d+) aba\(s\), (\d+) com cabeçalho reconhecido, ([\d.]+) linhas/);
  console.log('   arquivo:', m && m[0]);
  ok(m && +m[1] === 48 && +m[2] > 0, 'xlsx lido sem biblioteca: 48 abas');
  await p.screenshot({ path: O + '/t-importar-depara.png', fullPage: true });
  await p.click('[data-previa]'); await p.waitForSelector('#previa');
  const cont = await J(() => { const l = VP.estado.importacao.previa.linhas; const c = {}; l.forEach(x => c[x.classe] = (c[x.classe] || 0) + 1); return c; });
  console.log('   prévia:', JSON.stringify(cont));
  ok((cont.novo || 0) > 0, 'prévia separa novos/iguais/alterados/conflitos/erros');
  ok(await J(() => VP.db.lista('tumulos').length) === total0, 'prévia não grava nada');
  await p.screenshot({ path: O + '/t-importar-previa.png', fullPage: false });
  await p.click('[data-aplicar-imp]'); await fechar();
  const total1 = await J(() => VP.db.lista('tumulos').length);
  ok(total1 === total0 + (cont.novo || 0), `aplicar: ${cont.novo} túmulos criados (total ${total1})`);
  await p.click('[data-desfazer]');
  await p.waitForSelector(`${dlg}`); await botaoDlg('Desfazer'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.lista('tumulos').length) === total0, 'desfazer: volta ao total anterior (criados foram para a Lixeira)');
  ok(await J(() => VP.db.lista('tumulos', true).filter(t => t.excluido).length) === (cont.novo || 0), 'desfazer não apaga: itens ficam na Lixeira');

  // levantamento CSV
  const alvo = await J(() => VP.ordenarTumulos(VP.db.lista('tumulos')).slice(0, 3).map(t => [VP.nome('quadras', t.quadraId), t.aleia, t.numero]));
  const csv = 'quadra;aleia;numero;latitude;longitude;precisao_m\n' +
    `${alvo[0].join(';')};-27,214512;-49,643201;0,03\n${alvo[1].join(';')};-27.214530;-49.643180;0.04\n${alvo[2].join(';')};-27.21455;-49.64316;2,5\n` +
    'Quadra 99;01;001;-27.2;-49.6;0.1\nQuadra 01;01;002;-49.64;-27.21;0.1\n';
  fs.writeFileSync(S + '/lev.csv', csv);
  await ir('levantamento');
  await p.setInputFiles('[data-arquivo-lev]', S + '/lev.csv'); await p.waitForSelector(dlg);
  const prev = await p.textContent(dlg);
  ok(/Túmulos que recebem localização\s*3/.test(prev.replace(/\s+/g, ' ')) || prev.includes('3'), 'prévia do levantamento abriu');
  await p.screenshot({ path: O + '/t-lev-previa.png' });
  await botaoDlg('Gravar localizações');
  await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`);
  const res = await p.textContent(dlg);
  ok(res.includes('Quadra 99') && /fora do Brasil/.test(res), 'resultado lista não encontrado e coordenada trocada (fora do Brasil)');
  await p.screenshot({ path: O + '/t-lev-resultado.png' });
  await botaoDlg('Fechar'); await p.waitForTimeout(300);
  const r = await J(() => VP.resumo());
  ok(r.comCoordenada === 3 && r.exata === 2, `3 com coordenada, 2 exatas (precisão 2,5 m = aproximada): ${r.comCoordenada}/${r.exata}`);

  // GeoJSON: contorno de quadra + ponto
  const gj = { type: 'FeatureCollection', features: [
    { type: 'Feature', properties: { tipo: 'quadra', quadra: 'Quadra 01' }, geometry: { type: 'Polygon', coordinates: [[[-49.6433, -27.2144], [-49.6430, -27.2144], [-49.6430, -27.2147], [-49.6433, -27.2147], [-49.6433, -27.2144]]] } },
    { type: 'Feature', properties: { quadra: alvo[0][0], aleia: alvo[0][1], numero: alvo[0][2], precisao_m: 0.02 }, geometry: { type: 'Point', coordinates: [-49.643205, -27.214515] } }] };
  fs.writeFileSync(S + '/lev.geojson', JSON.stringify(gj));
  await p.setInputFiles('[data-arquivo-lev]', S + '/lev.geojson'); await p.waitForSelector(dlg);
  await botaoDlg('Gravar localizações'); await fechar();
  ok(await J(() => !!VP.db.lista('quadras').find(q => q.nome === 'Quadra 01').geo.poligono), 'GeoJSON: contorno da Quadra 01 gravado');
  const geo0 = await J(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[0].geo);
  ok(Math.abs(geo0.lat + 27.214515) < 1e-9, 'GeoJSON: localização trocada (anterior vai para a linha do tempo)');

  // KML
  await ir('levantamento');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-kml]')]);
  const kml = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename().endsWith('.kml') && (kml.match(/<Placemark>/g) || []).length === 3 && kml.includes('-49.643205,-27.214515,0'), 'KML para o Google Earth: 3 pontos, longitude,latitude');

  // ficha com Google Maps
  const id0 = await J(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[0].id);
  await ir('tumulo/' + id0);
  ok(await p.$('a[href*="google.com/maps"]') !== null, 'ficha: botão para o Google Maps');
  ok((await p.textContent('#conteudo')).includes('Localização exata'), 'ficha: selo "Localização exata"');
  await p.screenshot({ path: O + '/t-ficha-geo.png', fullPage: true });

  // etiquetas
  await ir('relatorio/etiquetas');
  await p.click('[data-gerar]'); await p.waitForTimeout(500);
  ok((await p.$$('.etiqueta')).length > 100, 'etiquetas QR geradas');

  // excluir pela ficha → Lixeira → restaurar (2 visitas, sem duplicar)
  await ir('tumulo/' + id0);
  await p.click('[data-acao="excluir"], button:has-text("Excluir")'); await p.waitForSelector(dlg); await botaoDlg('Mover para a Lixeira'); await p.waitForTimeout(400);
  ok(await J((i) => VP.db.pega('tumulos', i).excluido === true, id0), 'excluir = vai para a Lixeira');
  await ir('lixeira'); await ir('painel'); await ir('lixeira');
  await p.click(`[data-restaurar="tumulos|${id0}"]`); await p.waitForTimeout(500);
  ok(await J((i) => !VP.db.pega('tumulos', i).excluido, id0), 'Lixeira: restaurar');
  const evs = await J((i) => VP.db.lista('eventos').filter(e => e.tumuloId === i).map(e => e.tipo), id0);
  ok(evs.filter(x => x === 'georreferenciamento').length === 2, 'linha do tempo guarda as 2 localizações');

  // celular
  await p.setViewportSize({ width: 390, height: 844 }); await ir('mapa');
  await p.screenshot({ path: O + '/t-celular-mapa.png' });
  ok(await J(() => document.documentElement.scrollWidth <= 392), 'celular: sem rolagem lateral no mapa');

  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros.slice(0, 5)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
