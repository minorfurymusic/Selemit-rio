// Aplicativo de campo do cemitério com servidor: sem internet grava no aparelho; com internet envia.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execSync } = require('child_process');
const simular = require('./simulador-supabase.js');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const sql = (q) => execSync(`psql -h /tmp/vitalpat-pg -p 5499 -U postgres -d s_unico -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim();
const PESSOAS = { 'bia@ex.gov.br': '00000000-0000-0000-0000-0000000000b1', 'caio@ex.gov.br': '00000000-0000-0000-0000-0000000000c1', 'davi@ex.gov.br': '00000000-0000-0000-0000-0000000000d1' };
const BANCOS = { cemiterio: { url: 'https://cem-teste.supabase.co', porta: 3001, pessoas: Object.fromEntries(Object.entries(PESSOAS).map(([e, id]) => [e, { id, senha: 'segredo123' }])) } };
const FOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const nova = async (opts = {}) => { const ctx = await b.newContext(Object.assign({ locale: 'pt-BR' }, opts)); const est = await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.ctx = ctx; p.est = est; return p; };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); };
  const criar = (p, codigo) => p.evaluate(async ([c, f]) => { await salvarRegistro('tumulo', { fotos: [f], gps: { lat: -27.21, lon: -49.64, precisao: 8 } }, { codigo: c, cadastrado: true, estrutura: '2', limpeza: '3', identificacao: '1', tampa: '0', sinaisDeVisita: 'Não', observacao: '' }); }, [codigo, FOTO]);

  const p = await nova({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await entrar(p, 'davi@ex.gov.br'); await p.waitForURL('**/cemiterio/app-campo/**'); await p.waitForSelector('[data-ir]');
  ok((await p.textContent('.aviso-demo')).includes('Conectado ao servidor'), 'app de campo mostra que está conectado');
  await p.evaluate(() => navigator.serviceWorker.ready);

  // sem internet
  await p.ctx.setOffline(true); await p.waitForTimeout(300);
  ok((await p.textContent('#conexao')) === 'Sem internet', 'aparelho sem internet');
  await criar(p, 'Q01-A1-1');
  await p.evaluate(() => render()); await p.waitForSelector('#qtd-aguardando');
  ok((await p.textContent('#qtd-aguardando')) === '1', 'sem internet: o registro fica aguardando no aparelho');
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '0', 'nada chegou ao banco ainda');
  await p.screenshot({ path: __dirname + '/cem-prints/c-sem-internet.png' });

  // internet volta → envio automático
  await p.ctx.setOffline(false);
  await p.waitForFunction(() => document.querySelector('#qtd-aguardando')?.textContent === '0', null, { timeout: 30000 }).catch(() => {});
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '1', 'internet voltou: registro enviado sozinho');
  const reg = JSON.parse(sql("select dados from cemiterio.docs where colecao='registrosCampo'"));
  ok(reg.fotos[0].caminho && !reg.fotos[0].dataURL && Object.keys(p.est.arquivos).some((k) => k.startsWith('registrosCampo/')) && reg.dados.codigo === 'Q01-A1-1' && reg.gps.precisao === 8, 'registro no banco com foto no armazenamento, GPS e notas');
  ok(sql("select alterado_por from cemiterio.historico where colecao='registrosCampo'") === PESSOAS['davi@ex.gov.br'], 'banco registra quem enviou (Davi)');

  // envio pelo botão
  await criar(p, 'Q01-A1-2');
  await p.evaluate(() => { location.hash = 'registros'; }); await p.waitForSelector('#enviar');
  await p.click('#enviar'); await p.waitForSelector('.resultado-envio');
  ok((await p.textContent('.resultado-envio')).includes('1 registro(s) enviado(s)') || (await p.textContent('.resultado-envio')).includes('1registro'), 'botão Enviar: tela de resultado com quantos foram');
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '2', 'banco com 2 registros de campo');
  await p.screenshot({ path: __dirname + '/cem-prints/c-enviado.png' });

  // consulta não pode enviar
  const q = await nova();
  await entrar(q, 'caio@ex.gov.br'); await q.waitForURL('**/cemiterio/gestao/**');
  await q.goto('http://localhost:8765/cemiterio/app-campo/#registros'); await q.waitForSelector('#tela');
  await criar(q, 'Q02-A1-5'); await q.evaluate(() => render()); await q.waitForSelector('#enviar');
  await q.click('#enviar'); await q.waitForSelector('.resultado-envio');
  ok((await q.textContent('.resultado-envio')).includes('Seu acesso não permite enviar'), 'consulta: envio recusado com motivo claro');
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '2', 'banco não recebeu o registro da consulta');
  ok((await q.textContent('.lista')).includes('Não enviado: Seu acesso não permite'), 'registro recusado continua no aparelho com o motivo');

  // gestão vê o que chegou
  const g = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(g, 'bia@ex.gov.br'); await g.waitForURL('**/cemiterio/gestao/**'); await g.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(await g.evaluate(() => VP.db.lista('registrosCampo').length) === 2, 'Gestão recebe os 2 registros do aplicativo de campo');
  ok(erros.length === 0, 'sem erros de página ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU (banco real local; login e fotos simulados)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
