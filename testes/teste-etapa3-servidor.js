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
      tumulos: [{ id: 'T1', cemiterioId: 'C1', quadraId: 'Q1', aleia: '01', numero: '001', tipo: 'gaveta', ocupacao: 'vago', fotos: [] }, { id: 'N1', cemiterioId: 'C1', quadraId: 'Q2', aleia: '1', numero: '1', tipo: 'ossario', ocupacao: 'vago', fotos: [] }],
      funerarias: [{ id: 'F1', nome: 'Funerária Teste' }] });
  });
  // concessão + sepultamento antigo + exumação pelas telas
  await g.goto('http://localhost:8765/cemiterio/gestao/#tumulo/T1'); await g.waitForTimeout(500);
  await g.click('[data-e3="concessao"]'); await g.waitForSelector(dlg);
  await g.selectOption(`${dlg} [name=tipo]`, 'temporaria'); await g.fill(`${dlg} [name=inicio]`, '2018-01-01'); await g.fill(`${dlg} [name=fim]`, '2023-01-01'); await g.fill(`${dlg} [name=titular]`, 'Titular Teste');
  await g.click(`${dlg} footer button:has-text("Salvar")`); await g.waitForTimeout(800);
  await g.click('[data-e3="registrar"]'); await g.waitForSelector(dlg);
  await g.fill(`${dlg} [name=falecido]`, 'Pessoa Teste'); await g.fill(`${dlg} [name=data]`, '2018-01-02');
  await g.click(`${dlg} footer button:has-text("Salvar")`); await g.waitForTimeout(800);
  await g.click('[data-exumar]'); await g.waitForSelector(dlg);
  await g.selectOption(`${dlg} [name=motivo]`, 'prazo'); await g.fill(`${dlg} [name=processo]`, '1/2026'); await g.fill(`${dlg} [name=dataPrevista]`, '2026-10-07');
  await g.click(`${dlg} footer button:has-text("Salvar")`); await g.waitForTimeout(800);
  await g.click('[data-realizar-ex]'); await g.waitForSelector(dlg);
  for (const [k, v] of [['responsavel', 'R'], ['testemunha1', 'A'], ['testemunha2', 'B']]) await g.fill(`${dlg} [name=${k}]`, v);
  await g.selectOption(`${dlg} [name=destino]`, 'ossario'); await g.selectOption(`${dlg} [name=ossarioId]`, 'N1');
  await g.click(`${dlg} footer button:has-text("Salvar")`); await g.waitForSelector(`${dlg} .resultado-numeros`);
  const q = (x) => sql(x);
  ok(q("select count(*) from cemiterio.docs where colecao in ('concessoes','sepultamentos','exumacoes')") === '3', 'concessão, sepultamento e exumação gravados no banco');
  ok(q("select dados->>'ocupacao' from cemiterio.docs where colecao='tumulos' and id='T1'") === 'vago' && q("select dados->>'ocupacao' from cemiterio.docs where colecao='tumulos' and id='N1'") === 'ocupado', 'banco: gaveta vaga e nicho ocupado');
  ok(Number(q("select count(*) from cemiterio.historico where colecao='sepultamentos'")) >= 2, 'histórico do banco guarda as versões do sepultamento');
  await g.reload(); await pronto(g);
  ok(await g.evaluate(() => VP.restosNoOssario('N1').length === 1 && VP.concessaoAtual('T1')?.titular === 'Titular Teste'), 'recarregar lê tudo do servidor');
  // consulta: não vê botões e o banco recusa
  const c = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(c, 'caio@ex.gov.br'); await c.waitForURL('**/cemiterio/gestao/**'); await pronto(c);
  await c.goto('http://localhost:8765/cemiterio/gestao/#tumulo/T1'); await c.waitForTimeout(500);
  ok(!(await c.isVisible('[data-e3]')) && !(await c.isVisible('[data-e3="agendar"]')), 'consulta não vê os botões da etapa 3');
  const recusa = await c.evaluate(async () => { try { await VP.db.gravar('concessoes', { id: 'X', tumuloId: 'T1', tipo: 'perpetua', situacao: 'vigente', titular: 'x' }); return 'gravou'; } catch (e) { return e.message; } });
  ok(recusa !== 'gravou', 'consulta: banco recusa gravar concessão → ' + recusa.slice(0, 60));
  ok(erros.length === 0, 'sem erros: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
