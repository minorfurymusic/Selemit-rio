// Robô: em cada tela, clica em cada botão diferente (por texto) e anota erro ou "não fez nada".
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const SIS = process.argv[2] || 'patrimonio';
const ROTAS = {
  patrimonio: ['painel', 'bens/moveis', 'bens/imoveis', 'imoveis', 'imoveis/demonstrativo', 'imoveis/documentos', 'imoveis/cessoes', 'imoveis/pendencias', 'bem/@IMO', 'bens', 'bem/@BEM', 'novo-bem/movel', 'novo-bem/imovel', 'entradas', 'transferencias', 'inventario', 'financeiro/fechamento', 'financeiro/reavaliacao', 'financeiro/melhorias', 'financeiro/baixas', 'financeiro/contabilidade', 'relatorios', 'relatorio/balancete', 'relatorio/etiquetas', 'historico', 'cadastros/unidades', 'cadastros/classificacoes', 'cadastros/produtos', 'unidade/U1', 'configuracoes', 'lixeira',
    'frota', 'frota/veiculos', 'frota/abastecimentos', 'frota/viagens', 'frota/contratos', 'frota/motoristas', 'frota/manutencao', 'frota/multas', 'frota/documentos', 'frota/pneus', 'frota/reservas', 'frota/cartao', 'manutencao', 'manutencao/chamados', 'manutencao/preventiva', 'manutencao/vistorias', 'manutencao/equipes'],
  cemiterio: ['painel', 'mapa', 'tumulos', 'tumulo/@TUM', 'vistorias', 'vistorias/recebidos', 'triagem', 'ordens', 'relatorio/triagem', 'sepultamentos', 'sepultamentos/lista', 'concessoes', 'exumacoes', 'exumacoes/ossario', 'vagas', 'cadastros/funerarias', 'processos', 'plaquetas', 'importar', 'levantamento', 'relatorios', 'relatorio/ocupacao', 'relatorio/etiquetas', 'cadastros', 'cadastros/cemiterios', 'configuracoes', 'lixeira']
};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  for (const k of ['patrimonio', 'cemiterio']) await ctx.route(`**/${k}/config-servidor.js`, (r) => r.fulfill({ contentType: 'text/javascript', body: `window.VP_SERVIDOR_${k.toUpperCase()} = { url: '', chavePublica: '', municipio: '' };` }));
  await ctx.addInitScript(() => { window.print = () => { window.__impresso = (window.__impresso || 0) + 1; }; });
  const p = await ctx.newPage();
  let erros = [];
  p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  let baixou = 0; p.on('download', () => { baixou++; });
  let escolheuArquivo = 0; p.on('filechooser', () => { escolheuArquivo++; });
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', SIS === 'patrimonio' ? 'patrimonio' : 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  const ids = await p.evaluate(() => ({ BEM: VP.db.dados.bens ? VP.db.lista('bens')[0]?.id : '', TUM: VP.db.dados.tumulos ? VP.db.lista('tumulos')[0]?.id : '', IMO: VP.db.dados.bens ? VP.db.lista('bens').find((b) => b.tipo === 'imovel')?.id : '' }));
  const problemas = []; let clicados = 0;
  for (let rota of ROTAS[SIS]) {
    rota = rota.replace('@BEM', ids.BEM).replace('@TUM', ids.TUM).replace('@IMO', ids.IMO);
    const abrir = async () => { await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => { d.close(); d.remove(); })); await p.evaluate((x) => { location.hash = ''; location.hash = x; }, rota); await p.waitForTimeout(350); };
    await abrir();
    const textos = await p.evaluate(() => {
      const vis = (el) => el.offsetParent !== null && !el.disabled && !el.closest('[hidden]');
      const els = [...document.querySelectorAll('#acoes-tela button, #acoes-tela label.botao, #conteudo button, #conteudo label.botao')].filter(vis);
      const vistos = new Set(); const r = [];
      for (const el of els) { const t = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50); if (!t || vistos.has(t)) continue; vistos.add(t); r.push(t); }
      return r;
    });
    for (const t of textos) {
      await abrir();
      erros = []; baixou = 0; escolheuArquivo = 0;
      const antes = await p.evaluate(() => ({ h: location.hash, c: document.getElementById('conteudo').innerHTML, d: document.querySelectorAll('dialog[open]').length, a: document.getElementById('aviso-rapido')?.textContent || '', imp: window.__impresso || 0 }));
      const el = await p.evaluateHandle((txt) => { const vis = (e) => e.offsetParent !== null && !e.disabled; return [...document.querySelectorAll('#acoes-tela button, #acoes-tela label.botao, #conteudo button, #conteudo label.botao')].filter(vis).find((e) => (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50) === txt); }, t);
      if (!(await el.evaluate((x) => !!x))) continue;
      if (/excluir|desfazer|encerrar|voltar aos dados|restaurar cópia|sair/i.test(t)) { continue; } // ações que apagam/encerram: não clicar às cegas
      try { await el.click({ timeout: 2000 }); } catch (e) { problemas.push({ rota, botao: t, motivo: 'não deu para clicar: ' + e.message.split('\n')[0] }); continue; }
      clicados++;
      await p.waitForTimeout(450);
      const depois = await p.evaluate(() => ({ h: location.hash, c: document.getElementById('conteudo').innerHTML, d: document.querySelectorAll('dialog[open]').length, a: document.getElementById('aviso-rapido')?.textContent || '', imp: window.__impresso || 0, sel: document.querySelectorAll('#conteudo input[type=checkbox]:checked').length }));
      const fez = depois.h !== antes.h || depois.c !== antes.c || depois.d !== antes.d || depois.a !== antes.a || depois.imp !== antes.imp || baixou || escolheuArquivo;
      if (erros.length) problemas.push({ rota, botao: t, motivo: 'ERRO: ' + erros[0].slice(0, 140) });
      else if (!fez) problemas.push({ rota, botao: t, motivo: 'não fez nada visível' });
    }
  }
  console.log(`${SIS}: ${ROTAS[SIS].length} telas, ${clicados} botões clicados, ${problemas.length} suspeito(s)`);
  for (const x of problemas) console.log(` - [${x.rota}] "${x.botao}": ${x.motivo}`);
  await b.close();
})();
