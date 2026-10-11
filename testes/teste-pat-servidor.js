const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
const simular = require('./simulador-supabase.js');
const O = __dirname + '/gestao-teste';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const sql = (q) => execSync(`psql -h /tmp/vitalpat-pg -p 5499 -U postgres -d s_unico -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim();
const BANCOS = { patrimonio: { url: 'https://pat-teste.supabase.co', porta: 3001, pessoas: {
  'bia@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000b1', senha: 'segredo123' },
  'caio@ex.gov.br': { id: '00000000-0000-0000-0000-0000000000c1', senha: 'segredo123' } } } };
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const nova = async () => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' }); const est = await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); }); p.est = est; return p; };
  const dlg = 'dialog.janela[open]';
  const ir = async (p, h) => { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(400); };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); await p.waitForURL('**/patrimonio/gestao/**'); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 }); };

  let p = await nova();
  await entrar(p, 'bia@ex.gov.br');
  ok((await p.textContent('#modo-sistema')) === 'Cidade Exemplo/SC', 'topo mostra a cidade conectada');
  ok(await p.evaluate(() => VP.db.lista('bens').length) === 0, 'com servidor o patrimônio começa vazio');
  ok((await p.$$('#menu a[data-rota="pessoas"]')).length === 1, 'admin vê Pessoas');
  ok(!(await p.$('[data-reset]')) && (await ir(p, 'configuracoes'), !(await p.$('[data-reset]'))) && !!(await p.$('[data-backup]')), 'Configurações: sem "voltar ao exemplo"/"restaurar", com "baixar cópia"');
  await p.fill('#form-cfg [name="entidade"]', 'Prefeitura de Cidade Exemplo').catch(() => {});
  await p.click('[data-salvar-cfg]'); await p.waitForTimeout(800);
  ok(sql("select count(*) from patrimonio.docs where colecao='meta' and id='config'") === '1', 'salvar Configurações grava no banco');
  // grava 2.500 bens de uma vez (lotes) com foto no primeiro
  await p.evaluate(async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const bens = Array.from({ length: 2500 }, (_, i) => ({ id: 'B' + i, codigo: i + 1, descricao: 'Bem de teste ' + (i + 1), status: 'ativo', fotos: i === 0 ? [{ id: 'F1', nome: 'f.png', tipo: 'image/png', dataURL: png, data: '2026-10-07' }] : [], anexos: [] }));
    await VP.db.gravarVarias({ bens });
  });
  ok(sql("select count(*) from patrimonio.docs where colecao='bens'") === '2500', '2.500 bens gravados no banco em lotes');
  const f = JSON.parse(sql("select dados->'fotos'->0 from patrimonio.docs where colecao='bens' and id='B0'"));
  ok(f.caminho === 'bens/B0/F1.png' && !('dataURL' in f) && p.est.arquivos['bens/B0/F1.png'] > 0, 'foto do bem no armazenamento; banco guarda só o caminho');
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(await p.evaluate(() => VP.db.lista('bens').length) === 2500, 'recarregando, 2.500 bens vêm do servidor (3 páginas)');
  ok((await p.evaluate(() => VP.db.pega('bens', 'B0').fotos[0].dataURL)).includes('/storage/v1/object/sign/patrimonio-arquivos/bens/B0/F1.png'), 'foto volta por link temporário');
  await ir(p, 'pessoas'); await p.waitForSelector('[data-pessoa]');
  const np = (await p.$$('[data-pessoa]')).length, nb = +sql('select count(*) from patrimonio.perfis'); ok(np === nb, `tela Pessoas lista todas as pessoas do banco (${np} de ${nb})`);
  await p.click('#sair'); await p.waitForURL(/motivo=saiu/);

  p = await nova();
  await entrar(p, 'caio@ex.gov.br');
  ok((await p.$$('#menu a[data-rota="pessoas"]')).length === 0, 'consulta não vê Pessoas');
  await ir(p, 'bem/B1');
  ok((await p.$$('[data-acao="transferir"]:visible, [data-editar]:visible')).length === 0, 'consulta não vê botões de alterar na ficha do bem');
  await p.evaluate(async () => { const x = VP.db.pega('bens', 'B1'); x.descricao = 'tentativa'; await VP.db.gravar('bens', x).catch(() => {}); });
  await p.waitForSelector(dlg);
  ok((await p.textContent(dlg)).includes('Seu acesso não permite') && sql("select dados->>'descricao' from patrimonio.docs where id='B1'") === 'Bem de teste 2', 'consulta: banco recusa e a tela explica');
  ok(sql("select count(*) from patrimonio.historico where colecao='bens'") === '2500', 'histórico: 1 linha por bem criado, nenhuma falsa');
  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros.slice(0, 4)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU (banco e regras reais em PostgreSQL+PostgREST locais; login e fotos simulados)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
