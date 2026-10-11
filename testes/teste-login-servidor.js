// Login com servidor, usando um Supabase SIMULADO (as respostas da API são imitadas aqui; não é o Supabase real).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (sub, email) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, email, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.assinatura`;
// Pessoas em cada banco simulado
const BANCOS = {
  patrimonio: { url: 'https://pat-teste.supabase.co', pessoas: { 'ana@ex.gov.br': { id: '11111111-1111-1111-1111-111111111111', senha: 'segredo123', perfil: { nome: 'Ana', papel: 'gestor', ativo: true } }, 'bia@ex.gov.br': { id: '22222222-2222-2222-2222-222222222222', senha: 'segredo123', perfil: { nome: 'Bia', papel: 'admin', ativo: true } } } },
  cemiterio: { url: 'https://cem-teste.supabase.co', pessoas: { 'bia@ex.gov.br': { id: '33333333-3333-3333-3333-333333333333', senha: 'segredo123', perfil: { nome: 'Bia', papel: 'admin', ativo: true } }, 'caio@ex.gov.br': { id: '44444444-4444-4444-4444-444444444444', senha: 'segredo123', perfil: { nome: 'Caio', papel: 'consulta', ativo: false } }, 'davi@ex.gov.br': { id: '55555555-5555-5555-5555-555555555555', senha: 'segredo123', perfil: { nome: 'Davi', papel: 'campo', ativo: true } } } }
};
const pedidosReset = [];
async function simular(ctx) {
  for (const [k, bd] of Object.entries(BANCOS)) {
    await ctx.route(`**/${k}/config-servidor.js`, (r) => r.fulfill({ contentType: 'text/javascript', body: `window.VP_SERVIDOR_${k.toUpperCase()} = { url: '${bd.url}', chavePublica: 'anon-teste', municipio: 'Cidade Exemplo/SC' };` }));
    await ctx.route(`${bd.url}/**`, async (r) => {
      const u = new URL(r.request().url());
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      if (u.pathname === '/auth/v1/token') {
        const { email, password } = JSON.parse(r.request().postData());
        const p = bd.pessoas[email];
        if (!p || p.senha !== password) return r.fulfill({ status: 400, headers: cors, contentType: 'application/json', body: JSON.stringify({ code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }) });
        const user = { id: p.id, email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
        return r.fulfill({ headers: cors, contentType: 'application/json', body: JSON.stringify({ access_token: jwt(p.id, email), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r-' + p.id, user }) });
      }
      if (u.pathname === '/auth/v1/logout') return r.fulfill({ status: 204, headers: cors });
      if (u.pathname === '/auth/v1/recover') { pedidosReset.push(k + ':' + JSON.parse(r.request().postData()).email); return r.fulfill({ headers: cors, contentType: 'application/json', body: '{}' }); }
      if (u.pathname === '/rest/v1/perfis') {
        const id = (u.searchParams.get('user_id') || '').replace('eq.', '');
        const p = Object.values(bd.pessoas).find((x) => x.id === id);
        return r.fulfill({ headers: cors, contentType: 'application/json', body: JSON.stringify(p ? [p.perfil] : []) });
      }
      return r.fulfill({ status: 404, headers: cors, body: '{}' });
    });
  }
}
(async () => {
  const b = await chromium.launch();
  const paginas = [];
  const novo = async () => { const ctx = await b.newContext({ locale: 'pt-BR' }); await simular(ctx); const p = await ctx.newPage(); const erros = []; p.on('pageerror', (e) => erros.push(e.message)); p.erros = erros; paginas.push(p); return p; };
  const entrar = async (p, email, senha) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', senha); await p.click('#entrar'); };

  let p = await novo();
  await p.goto('http://localhost:8765/');
  ok((await p.textContent('#rotulo-usuario')) === 'E-mail', 'com servidor configurado o login pede e-mail');
  ok((await p.textContent('#rodape')).includes('Cidade Exemplo/SC'), 'mostra a cidade conectada');
  await entrar(p, 'patrimonio', '123456'); await p.waitForTimeout(800);
  ok(p.url().endsWith(':8765/') && !(await p.evaluate(() => localStorage.getItem('vitalpat-sessao'))), 'login de demonstração (patrimonio/123456) recusado quando há servidor');
  await entrar(p, 'ana@ex.gov.br', 'errada'); await p.waitForTimeout(800);
  ok((await p.textContent('#erro')).includes('E-mail ou senha incorretos'), 'senha errada: mensagem clara');
  await entrar(p, 'ana@ex.gov.br', 'segredo123'); await p.waitForURL('**/patrimonio/gestao/**');
  const s = await p.evaluate(() => JSON.parse(localStorage.getItem('vitalpat-sessao')));
  ok(s.modo === 'servidor' && s.sistema === 'patrimonio' && s.papel === 'gestor' && !!(await p.evaluate(() => localStorage.getItem('vitalpat-auth-patrimonio'))), 'Ana (só patrimônio) entra direto na Gestão do Patrimônio, sessão guardada');

  p = await novo();
  await entrar(p, 'bia@ex.gov.br', 'segredo123'); await p.waitForSelector('#escolher:not([hidden])');
  ok((await p.$$('#opcoes button')).length === 2, 'Bia (nos dois bancos) escolhe qual sistema abrir');
  await p.click('#opcoes button:has-text("Cemitério")'); await p.waitForURL('**/cemiterio/gestao/**');
  ok(true, 'Bia abre o Cemitério');

  p = await novo();
  await entrar(p, 'caio@ex.gov.br', 'segredo123'); await p.waitForTimeout(800);
  ok((await p.textContent('#erro')).includes('ainda não foi liberado'), 'Caio (inativo) recebe "aguardando liberação"');
  ok(!(await p.evaluate(() => localStorage.getItem('vitalpat-sessao'))), 'Caio não fica com sessão');

  p = await novo();
  await entrar(p, 'davi@ex.gov.br', 'segredo123'); await p.waitForURL('**/cemiterio/app-campo/**');
  ok(true, 'Davi (papel campo) abre direto o aplicativo de campo');

  p = await novo();
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'ana@ex.gov.br'); await p.click('#esqueci'); await p.waitForTimeout(800);
  ok(pedidosReset.includes('patrimonio:ana@ex.gov.br') && pedidosReset.includes('cemiterio:ana@ex.gov.br'), 'esqueci a senha: pedido enviado aos bancos');
  await p.goto('http://localhost:8765/?redefinir=cemiterio');
  ok(await p.isVisible('#form-nova'), 'link do e-mail abre a tela de nova senha');

  const todosErros = paginas.flatMap((x) => x.erros);
  ok(todosErros.length === 0, 'sem erros de página ' + JSON.stringify(todosErros.slice(0, 3)));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO PASSOU (Supabase simulado)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
