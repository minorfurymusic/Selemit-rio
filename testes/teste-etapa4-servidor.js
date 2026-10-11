// Etapa 2 com servidor (PostgreSQL + PostgREST locais imitando o Supabase):
// app baixa a lista → sem internet registra vistoria, aviso e ordem feita → envia → Gestão confere.
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
  const nova = async (opts = {}) => { const ctx = await b.newContext(Object.assign({ locale: 'pt-BR' }, opts)); await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); return p; };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); };
  const pronto = (p) => p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  const dlg = 'dialog.janela[open]';
  const g = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(g, 'bia@ex.gov.br'); await g.waitForURL('**/cemiterio/gestao/**'); await pronto(g);
  await g.evaluate(async () => {
    await VP.db.gravarVarias({ cemiterios: [{ id: 'C1', nome: 'Cemitério Teste' }], quadras: [{ id: 'Q1', cemiterioId: 'C1', nome: 'Quadra 01', codigo: '01', tipo: 'comum', ordem: 1 }, { id: 'Q2', cemiterioId: 'C1', nome: 'Ossário', codigo: 'OS', tipo: 'comum', ordem: 2 }],
      tumulos: [{ id: 'T1', cemiterioId: 'C1', quadraId: 'Q1', aleia: '01', numero: '001', tipo: 'sepultura', ocupacao: 'ocupado', fotos: [] }, { id: 'N1', cemiterioId: 'C1', quadraId: 'Q2', aleia: '1', numero: '1', tipo: 'ossario', ocupacao: 'vago', fotos: [] }],
      funerarias: [{ id: 'F1', nome: 'Funerária Teste' }] });
  });
  // processo: abrir, notificar (comprovante vai ao armazenamento), edital e decidir pelas funções das telas
  await g.evaluate(async () => {
    const t = VP.db.pega('tumulos', 'T1');
    t.situacao = 'indicio'; await VP.db.gravar('tumulos', t);
    const p = await VP.etapa4.abrir(t, { processo: '10/2026', revisor: 'Comissão', motivo: 'teste' });
    p.notificacoes.push({ id: 'n1', meio: 'email', data: VP.Plataforma.hoje(), destinatario: 'X', contato: 'x@exemplo.invalid', resultado: 'naoLocalizado', comprovante: [{ id: 'c1', tipo: 'image/png', dataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }] });
    await VP.db.gravar('processos', p);
  });
  const q = (x) => sql(x);
  ok(q("select dados->>'situacao' from cemiterio.docs where colecao='tumulos' and id='T1'") === 'apuracao' && q("select count(*) from cemiterio.docs where colecao='processos'") === '1', 'banco: processo aberto e túmulo em apuração');
  const notif = JSON.parse(q("select dados->'notificacoes' from cemiterio.docs where colecao='processos'"));
  ok(notif[0].comprovante[0].caminho && !notif[0].comprovante[0].dataURL, 'comprovante da notificação vai para o armazenamento (registro guarda só o caminho)');
  await g.reload(); await pronto(g);
  await g.goto('http://localhost:8765/cemiterio/gestao/#processos'); await g.waitForTimeout(600);
  ok((await g.textContent('#tab-processos')).includes('10/2026'), 'lista de processos lê do servidor');
  const c = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(c, 'caio@ex.gov.br'); await c.waitForURL('**/cemiterio/gestao/**'); await pronto(c);
  const pid = await c.evaluate(() => VP.db.lista('processos')[0].id);
  await c.goto('http://localhost:8765/cemiterio/gestao/#processos/' + pid); await c.waitForTimeout(600);
  ok(!(await c.isVisible('[data-p4="decidir"]')) && !(await c.isVisible('[data-p4="notificar"]')), 'consulta não vê os botões do processo');
  const recusa = await c.evaluate(async () => { try { const p = VP.db.lista('processos')[0]; p.situacao = 'encerrado'; await VP.db.gravar('processos', p); return 'gravou'; } catch (e) { return e.message; } });
  ok(recusa !== 'gravou', 'consulta: banco recusa alterar o processo → ' + recusa.slice(0, 50));
  ok(erros.length === 0, 'sem erros: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
