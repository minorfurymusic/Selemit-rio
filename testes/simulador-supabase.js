// Liga o navegador automático a um "Supabase" de teste:
//  - dados (rest/v1) → PostgREST + PostgreSQL locais com o roteiro de instalação REAL (regras de acesso reais);
//  - login (auth/v1) e fotos (storage/v1) → simulados aqui.
const crypto = require('crypto');
const SEGREDO = 'segredo-de-teste-local-com-32-caracteres-ou-mais';
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const jwt = (sub, email) => { const h = b64({ alg: 'HS256', typ: 'JWT' }), p = b64({ sub, email, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }); return `${h}.${p}.${crypto.createHmac('sha256', SEGREDO).update(`${h}.${p}`).digest('base64url')}`; };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
module.exports = async function simular(ctx, bancos) {
  const estado = { arquivos: {}, pedidosRest: 0 };
  for (const [k, bd] of Object.entries(bancos)) {
    await ctx.route(`**/${k}/config-servidor.js`, (r) => r.fulfill({ contentType: 'text/javascript', body: `window.VP_SERVIDOR_${k.toUpperCase()} = { url: '${bd.url}', chavePublica: 'anon-teste', municipio: 'Cidade Exemplo/SC' };` }));
    await ctx.route(`${bd.url}/**`, async (r) => {
      const req = r.request(); const u = new URL(req.url());
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: CORS });
      if (u.pathname.startsWith('/rest/v1/')) {
        estado.pedidosRest++;
        const h = Object.assign({}, req.headers()); delete h.apikey; delete h.host;
        const resp = await r.fetch({ url: `http://127.0.0.1:${bd.porta}${u.pathname.replace('/rest/v1', '')}${u.search}`, headers: h });
        return r.fulfill({ response: resp, headers: Object.assign({}, resp.headers(), CORS) });
      }
      if (u.pathname === '/auth/v1/token') {
        const { email, password } = JSON.parse(req.postData());
        const p = bd.pessoas[email];
        if (!p || p.senha !== password) return r.fulfill({ status: 400, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }) });
        const user = { id: p.id, email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
        return r.fulfill({ headers: CORS, contentType: 'application/json', body: JSON.stringify({ access_token: jwt(p.id, email), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r-' + p.id, user }) });
      }
      if (u.pathname === '/auth/v1/logout') return r.fulfill({ status: 204, headers: CORS });
      if (/^\/storage\/v1\/object\/sign\/[a-z]+-arquivos$/.test(u.pathname) && req.method() === 'POST') {
        const { paths } = JSON.parse(req.postData());
        const balde = u.pathname.split('/').pop();
        return r.fulfill({ headers: CORS, contentType: 'application/json', body: JSON.stringify(paths.map((p) => ({ path: p, signedURL: `/object/sign/${balde}/${p}?token=t`, error: null }))) });
      }
      const mUp = u.pathname.match(/^\/storage\/v1\/object\/([a-z]+-arquivos)\/(.+)$/);
      if (mUp && req.method() === 'POST') {
        const caminho = decodeURIComponent(mUp[2]);
        estado.arquivos[caminho] = (req.postDataBuffer() || Buffer.alloc(0)).length;
        estado.baldes = Object.assign(estado.baldes || {}, { [caminho]: mUp[1] });
        return r.fulfill({ headers: CORS, contentType: 'application/json', body: JSON.stringify({ Key: mUp[1] + '/' + caminho, Id: caminho }) });
      }
      if (u.pathname.startsWith('/storage/v1/object/sign/')) return r.fulfill({ headers: { ...CORS, 'content-type': 'image/png' }, body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64') });
      return r.fulfill({ status: 404, headers: CORS, body: '{}' });
    });
  }
  return estado;
};
