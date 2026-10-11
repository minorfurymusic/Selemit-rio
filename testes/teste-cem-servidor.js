const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
const simular = require('./simulador-supabase.js');
const S = __dirname, O = S + '/cem-prints';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const sql = (q) => execSync(`psql -h /tmp/vitalpat-pg -p 5499 -U postgres -d s_unico -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim();
const BANCOS = { cemiterio: { url: 'https://cem-teste.supabase.co', porta: 3001, pessoas: {
  'bia@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000b1', senha: 'segredo123' },
  'caio@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000c1', senha: 'segredo123' },
  'eva@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000e1', senha: 'segredo123' } } } };
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const nova = async () => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true }); const est = await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); }); p.est = est; return p; };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (p, t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const fechar = async (p) => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`, { timeout: 120000 }); await botaoDlg(p, 'Fechar'); await p.waitForTimeout(200); };
  const ir = async (p, h) => { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(400); };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); await p.waitForURL('**/cemiterio/gestao/**'); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 }); };

  // sem login → volta ao login
  let p = await nova();
  await p.evaluate(() => 0);
  await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.setItem('vitalpat-sessao', JSON.stringify({ usuario: 'x', sistema: 'cemiterio', modo: 'servidor' })));
  await p.goto('http://localhost:8765/cemiterio/gestao/'); await p.waitForURL(/motivo=expirou/);
  ok(true, 'sem sessão do servidor: volta ao login ("sessão terminou")');

  // admin
  p = await nova();
  await entrar(p, 'bia@ex.gov.br');
  ok((await p.textContent('#modo-sistema')) === 'Cidade Exemplo/SC' && (await p.textContent('.rodape-demo')).includes('Bia Admin'), 'topo mostra a cidade e a pessoa conectada');
  ok(await p.evaluate(() => VP.db.lista('tumulos').length) === 0, 'com servidor o sistema começa vazio (sem dados de exemplo)');
  ok((await p.$$('#menu a[data-rota="pessoas"]')).length === 1, 'admin vê o menu Pessoas');
  await p.screenshot({ path: O + '/s-painel-vazio.png' });

  // importação real da lista de chãos (6.247 túmulos) em lotes
  await ir(p, 'importar');
  await p.setInputFiles('[data-arquivo]', require('path').resolve(__dirname, '..') + '/cemiterio/modelos-importacao/lista-chaos-modelo.xlsx');
  await p.waitForSelector('[data-previa]', { timeout: 30000 });
  await p.click('[data-previa]'); await p.waitForSelector('#previa');
  const novos = await p.evaluate(() => VP.estado.importacao.previa.linhas.filter((l) => l.classe === 'novo').length);
  const t0 = Date.now();
  await p.click('[data-aplicar-imp]'); await fechar(p);
  console.log(`   importação: ${novos} túmulos em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  ok(+sql("select count(*) from cemiterio.docs where colecao = 'tumulos'") === novos, `banco tem ${novos} túmulos gravados`);
  ok(+sql("select count(*) from cemiterio.docs where colecao = 'quadras'") >= 40, 'quadras criadas no banco');

  // recarregar: dados vêm do servidor
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(await p.evaluate(() => VP.db.lista('tumulos').length) === novos, 'recarregando a página, os túmulos vêm do servidor (mais de 1.000, em páginas)');

  // alterar + excluir (Lixeira) + histórico
  const id = await p.evaluate(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[0].id);
  await p.evaluate(async (i) => { const t = VP.db.pega('tumulos', i); t.ocupacao = 'ocupado'; await VP.db.gravarVarias({ tumulos: [t], eventos: [VP.novoEvento(i, 'alteracao', { descricao: 'teste' })] }); }, id);
  ok(sql(`select dados->>'ocupacao' from cemiterio.docs where colecao='tumulos' and id='${id}'`) === 'ocupado', 'alteração gravada no banco');
  ok(+sql(`select count(*) from cemiterio.historico where colecao='tumulos' and id='${id}'`) === 2 && sql(`select dados_anteriores->>'ocupacao' from cemiterio.historico where id='${id}' and versao=2`) === 'nao-informado', 'histórico guarda o valor anterior');
  ok(sql(`select atualizado_por from cemiterio.docs where colecao='tumulos' and id='${id}'`) === '00000000-0000-0000-0000-0000000000b1', 'banco registra quem alterou');
  await ir(p, 'tumulo/' + id);
  await p.click('[data-acao="excluir"]'); await p.waitForSelector(dlg); await botaoDlg(p, 'Mover para a Lixeira'); await p.waitForTimeout(1000);
  ok(sql(`select excluido from cemiterio.docs where colecao='tumulos' and id='${id}'`) === 't', 'excluir marca Lixeira no banco (registro continua lá)');

  // foto → armazenamento (outro túmulo, que não está na Lixeira)
  const id2 = await p.evaluate(() => VP.ordenarTumulos(VP.db.lista('tumulos'))[1].id);
  await ir(p, 'tumulo/' + id2);
  await p.setInputFiles('[data-foto]', require('path').resolve(__dirname, '..') + '/cemiterio/app-campo/icones/icone-192.png'); await p.waitForTimeout(1500);
  const foto = JSON.parse(sql(`select dados->'fotos'->0 from cemiterio.docs where colecao='tumulos' and id='${id2}'`));
  ok(foto.caminho && foto.caminho.startsWith(`tumulos/${id2}/`) && !('dataURL' in foto) && p.est.arquivos[foto.caminho] > 0, 'foto enviada ao armazenamento; banco guarda só o caminho');
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 }); await ir(p, 'tumulo/' + id2);
  const src = await p.getAttribute('.ficha-foto img', 'src').catch(() => 'sem img'); console.log('   src da foto:', String(src).slice(0, 120)); const fr = await p.evaluate((i) => JSON.stringify(VP.db.pega('tumulos', i).fotos).slice(0, 200), id2); console.log('   fotos na memória:', fr);
  ok((src || '').includes('/storage/v1/object/sign/cemiterio-arquivos/'), 'depois de recarregar, a foto aparece por link temporário');
  await p.screenshot({ path: O + '/s-ficha-foto.png' });

  // desfazer importação
  await ir(p, 'importar'); await p.click('[data-desfazer]'); await p.waitForSelector(dlg); await botaoDlg(p, 'Desfazer');
  await p.waitForFunction(() => document.querySelector('#area-imp')?.textContent.includes('Desfeita'), null, { timeout: 120000 });
  ok(+sql("select count(*) from cemiterio.docs where colecao='tumulos' and not excluido") === 0 && +sql("select count(*) from cemiterio.docs where colecao='tumulos'") === novos, 'desfazer: todos na Lixeira, nada apagado');

  // pessoas
  await ir(p, 'pessoas'); await p.waitForSelector('[data-pessoa]');
  await p.screenshot({ path: O + '/s-pessoas.png' });
  await p.click('[data-pessoa="00000000-0000-0000-0000-0000000000e1"]'); await p.waitForSelector(dlg);
  await p.selectOption(`${dlg} [name=papel]`, 'gestor'); await p.check(`${dlg} [name=ativo]`); await botaoDlg(p, 'Salvar'); await p.waitForTimeout(800);
  ok(sql("select papel || '/' || ativo from cemiterio.perfis where email='eva@ex.gov.br'") === 'gestor/true', 'admin libera a Eva como gestora pela tela Pessoas');
  await p.click('[data-pessoa="00000000-0000-0000-0000-0000000000b1"]'); await p.waitForSelector(dlg);
  await p.uncheck(`${dlg} [name=ativo]`); await botaoDlg(p, 'Salvar'); await p.waitForTimeout(800);
  ok((await p.textContent(`${dlg} .erro-form`)).includes('pelo menos um administrador'), 'último admin não consegue se desativar');
  await botaoDlg(p, 'Cancelar');

  // sair
  await p.click('#sair'); await p.waitForURL(/motivo=saiu/);
  ok(!(await p.evaluate(() => localStorage.getItem('vitalpat-auth-cemiterio'))), 'Sair encerra a sessão do servidor');

  // consulta
  p = await nova();
  await entrar(p, 'caio@ex.gov.br');
  ok(await p.evaluate(() => VP.db.lista('tumulos', true).length) === novos, 'consulta vê os dados');
  ok((await p.$$('#menu a[data-rota="pessoas"], #menu a[data-rota="importar"]')).length === 0, 'consulta não vê Pessoas nem Importar');
  const antes = sql("select count(*) from cemiterio.historico");
  await p.evaluate(async () => { const t = VP.db.lista('tumulos', true)[0]; t.observacao = 'tentativa'; await VP.db.gravar('tumulos', t).catch(() => {}); });
  await p.waitForSelector(dlg);
  ok((await p.textContent(dlg)).includes('Seu acesso não permite'), 'consulta tentando gravar: mensagem clara');
  ok(sql("select count(*) from cemiterio.historico") === antes && +sql("select count(*) from cemiterio.docs where dados->>'observacao' = 'tentativa'") === 0, 'banco recusou a gravação da consulta');
  await p.screenshot({ path: O + '/s-consulta-recusado.png' });

  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros.slice(0, 4)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU (banco e regras reais em PostgreSQL+PostgREST locais; login e fotos simulados)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
