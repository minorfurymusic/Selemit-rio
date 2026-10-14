// Menu lateral em grupos com ícones desenhados; esconder (só ícones) e mostrar, lembrado no navegador; celular com nomes.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/menu-prints'; fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.message); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const pronto = () => p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await pronto();

  // 1) grupos e itens
  const m = await J(() => ({
    grupos: [...document.querySelectorAll('#menu .titulo-grupo')].map((x) => x.textContent),
    itens: [...document.querySelectorAll('#menu .grupo-menu')].map((g) => [...g.querySelectorAll('a')].map((a) => a.dataset.rota)),
    semIcone: [...document.querySelectorAll('#menu a')].filter((a) => !a.querySelector('.ic svg')).length,
    total: document.querySelectorAll('#menu a').length
  }));
  ok(m.grupos.join('|') === 'Visão geral|Bens|Movimentações|Controle|Sistema', 'cinco grupos: ' + m.grupos.join(', '));
  ok(JSON.stringify(m.itens) === JSON.stringify([['painel', 'relatorios'], ['bens/moveis', 'bens/imoveis', 'frota', 'controle'], ['entradas', 'transferencias', 'baixa-lote', 'termos'], ['inventario', 'manutencao', 'financeiro/fechamento'], ['historico', 'cadastros/unidades', 'configuracoes', 'planilhas', 'lixeira']]), 'cada item no seu grupo (Relatórios em Visão geral)');
  ok(m.total === 18 && m.semIcone === 0, `18 itens na demonstração, todos com ícone desenhado (sem ícone: ${m.semIcone})`);
  await p.screenshot({ path: `${O}/1-menu-aberto.png` });

  // 2) navegação continua acendendo o item certo
  await J(() => { location.hash = 'bens/imoveis'; }); await p.waitForTimeout(400);
  ok(await p.$eval('#menu a.ativo', (a) => a.dataset.rota) === 'bens/imoveis', 'item ativo acende');
  await J(() => { location.hash = 'painel'; }); await p.waitForTimeout(400);

  // 3) esconder: só ícones, nome ao parar o mouse
  await p.click('#esconder-menu'); await p.waitForTimeout(300);
  const e = await J(() => ({
    largura: document.getElementById('menu').getBoundingClientRect().width,
    nomeVisivel: document.querySelector('#menu a .nome').getBoundingClientRect().width,
    titulo: document.querySelector('#menu a[data-rota="frota"]').title,
    margem: getComputedStyle(document.querySelector('.principal')).marginLeft,
    botao: document.getElementById('esconder-menu').getAttribute('aria-label')
  }));
  ok(e.largura === 60 && e.nomeVisivel <= 1, `escondido: menu com 60px e nomes ocultos (largura ${e.largura})`);
  ok(e.titulo === 'Frota' && e.margem === '60px' && e.botao === 'Mostrar menu', 'nome aparece ao parar o mouse; tela ocupa o espaço; botão vira "Mostrar menu"');
  await p.hover('#menu a[data-rota="frota"]');
  await p.screenshot({ path: `${O}/2-menu-escondido.png` });

  // 4) lembrado depois de recarregar
  await p.reload(); await pronto();
  ok(await J(() => document.body.classList.contains('menu-recolhido')), 'continua escondido depois de recarregar');
  await J(() => { document.documentElement.dataset.theme = 'dark'; });
  await p.screenshot({ path: `${O}/3-menu-escondido-escuro.png` });
  await p.click('#esconder-menu'); await p.waitForTimeout(300);
  await p.screenshot({ path: `${O}/4-menu-aberto-escuro.png` });
  await J(() => { delete document.documentElement.dataset.theme; });
  await p.reload(); await pronto();
  ok(!(await J(() => document.body.classList.contains('menu-recolhido'))) && (await J(() => document.getElementById('menu').getBoundingClientRect().width)) === 210, 'mostrar de novo: volta com nomes e fica lembrado');

  // 5) celular: menu pelo ☰, sempre com nomes, sem o botão de esconder
  await p.click('#esconder-menu'); // deixa escondido no computador para ver que o celular ignora
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  await p.click('#abrir-menu'); await p.waitForTimeout(400);
  const c = await J(() => ({
    nome: document.querySelector('#menu a[data-rota="frota"] .nome').getBoundingClientRect().width,
    botao: getComputedStyle(document.getElementById('esconder-menu')).display,
    x: document.getElementById('menu').getBoundingClientRect().left
  }));
  ok(c.nome > 20 && c.botao === 'none' && c.x === 0, 'celular: menu abre pelo ☰ com nomes; sem botão de esconder');
  await p.screenshot({ path: `${O}/5-celular.png` });
  await p.click('#menu a[data-rota="termos"]'); await p.waitForTimeout(400);
  ok((await p.textContent("#titulo-tela")).startsWith("Termos") && !(await J(() => document.body.classList.contains('menu-aberto'))), 'celular: tocar no item abre a tela e fecha o menu');

  ok(erros.length === 0, 'sem erros na página: ' + JSON.stringify(erros));
  console.log(falhas ? `FALHARAM ${falhas}` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
