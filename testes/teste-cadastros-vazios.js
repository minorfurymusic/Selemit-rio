// Cadastros básicos vazios: pendência no Painel ("dados a receber da prefeitura") e aviso nas listas vazias do Novo bem.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/cadastros-vazios-prints'; fs.mkdirSync(O, { recursive: true });
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
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });

  // 1) com os dados de exemplo: nenhuma pendência de cadastro vazio e nenhum aviso no Novo bem
  ok(await J(() => VP.pendencias().filter((x) => x.chave.startsWith('cadastro-')).length) === 0, 'dados de exemplo: sem pendência de cadastro vazio');
  await ir('novo-bem/movel');
  ok(!(await p.textContent('#form-novo')).includes('dados a receber da prefeitura'), 'dados de exemplo: Novo bem sem aviso');

  // 2) cadastros vazios (como no servidor novo da cidade, sem dados enviados)
  // esconde as listas só nesta página (não grava nada no navegador)
  await J(() => { const orig = VP.db.lista.bind(VP.db); const vazias = ['entidades', 'unidades', 'classificacoes', 'contas', 'responsaveis', 'fornecedores']; VP.db.lista = (t, ...r) => (vazias.includes(t) ? [] : orig(t, ...r)); });
  const pend = await J(() => VP.pendencias().filter((x) => x.chave.startsWith('cadastro-')).map((x) => [x.chave, x.nivel, x.link]));
  ok(pend.length === 5, `5 pendências (fornecedores não: vêm da compra) de cadastro vazio: ${pend.map((x) => x[0]).join(', ')}`);
  ok(JSON.stringify(pend.filter((x) => x[1] === 'critico').map((x) => x[0]).sort()) === JSON.stringify(['cadastro-classificacoes', 'cadastro-entidades', 'cadastro-unidades']), 'entidades, unidades e classificações = urgente');
  ok(pend.every((x) => x[2] === '#cadastros/' + x[0].slice(9)), 'cada pendência leva à aba do cadastro');
  await ir('painel');
  const txt = await p.textContent('#conteudo');
  ok(txt.includes('Cadastro vazio: Unidades (centros de custo e locais) — dados a receber da prefeitura'), 'Painel mostra a pendência com o texto certo');
  ok(!(await J(() => [...document.querySelectorAll('.pendencias li')].some((li) => li.textContent.includes('Cadastro vazio') && li.querySelector('.p-qtd').textContent.trim()))), 'pendência de cadastro vazio sem número ao lado');
  await p.screenshot({ path: `${O}/1-painel.png` });

  await ir('novo-bem/movel');
  const avisos = await J(() => [...document.querySelectorAll('#form-novo .campo')].filter((c) => /dados a receber da prefeitura/.test(c.textContent)).map((c) => c.querySelector('label').textContent.replace('*', '').trim()));
  ok(JSON.stringify(avisos) === JSON.stringify(['Unidade', 'Responsável (vem da unidade)']), 'Novo bem: aviso embaixo de Unidade e Responsável: ' + avisos.join(', '));
  ok((await p.textContent('#form-novo')).includes('Ele é cadastrado sozinho pela compra'), 'Novo bem: Fornecedor avisa que vem da compra ou da nota');
  await p.screenshot({ path: `${O}/2-novo-bem.png` });

  ok(erros.length === 0, 'sem erros na página: ' + JSON.stringify(erros));
  console.log(falhas ? `FALHARAM ${falhas}` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
