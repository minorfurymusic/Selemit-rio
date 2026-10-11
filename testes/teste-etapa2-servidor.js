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
  const nova = async (opts = {}) => { const ctx = await b.newContext(Object.assign({ locale: 'pt-BR', acceptDownloads: true }, opts)); const est = await simular(ctx, BANCOS); const p = await ctx.newPage(); p.on('pageerror', (e) => erros.push(e.message)); p.ctx = ctx; p.est = est; return p; };
  const entrar = async (p, email) => { await p.goto('http://localhost:8765/'); await p.fill('#usuario', email); await p.fill('#senha', 'segredo123'); await p.click('#entrar'); };
  const pronto = (p) => p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });

  // 1. Administradora cadastra um túmulo e uma ordem
  const g = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(g, 'bia@ex.gov.br'); await g.waitForURL('**/cemiterio/gestao/**'); await pronto(g);
  await g.evaluate(async () => {
    await VP.db.gravarVarias({ cemiterios: [{ id: 'C1', nome: 'Cemitério Teste' }], quadras: [{ id: 'Q1', cemiterioId: 'C1', nome: 'Quadra 01', codigo: '01', tipo: 'comum', ordem: 1 }],
      tumulos: [{ id: 'T1', cemiterioId: 'C1', quadraId: 'Q1', aleia: '01', numero: '007', tipo: 'sepultura', ocupacao: 'ocupado', fotos: [], criadoEm: new Date().toISOString() },
        { id: 'T2', cemiterioId: 'C1', quadraId: 'Q1', aleia: '01', numero: '008', tipo: 'sepultura', ocupacao: 'ocupado', fotos: [], criadoEm: new Date().toISOString() }] });
    await VP.db.gravar('ordensServico', { id: 'OS1', numero: '1/2026', tumuloId: 'T2', tipo: 'limpeza', prioridade: 'normal', origem: 'familia', descricao: 'Limpar', situacao: 'aberta', abertaEm: '2026-10-01', prazo: '2026-10-20', historico: [] });
  });
  ok(sql("select count(*) from cemiterio.docs where colecao in ('tumulos','ordensServico')") === '3', 'túmulos e ordem gravados no banco');

  // 2. Campo: abre com internet → lista baixada sozinha
  // Sem service worker aqui: o navegador de teste não intercepta os pedidos feitos por ele (a simulação do servidor ficaria de fora).
  // O funcionamento sem internet com service worker é provado nos testes da demonstração.
  const p = await nova({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await entrar(p, 'davi@ex.gov.br'); await p.waitForURL('**/cemiterio/app-campo/**'); await p.waitForSelector('[data-ir]');
  await p.waitForFunction(() => !!localStorage.getItem('vitalpat-cemiterio-lista'), null, { timeout: 20000 }).catch(() => {});
  const lista = await p.evaluate(() => JSON.parse(localStorage.getItem('vitalpat-cemiterio-lista')));
  ok(lista && lista.tumulos.length === 2 && lista.tumulos.some((t) => t.codigo === 'Q01-A1-7') && lista.ordens.length === 1 && lista.ordens[0].codigo === 'Q01-A1-8', 'lista baixada do servidor com códigos iguais aos da Gestão: ' + JSON.stringify(lista?.tumulos.map((t) => t.codigo)));
  await p.reload(); await p.waitForSelector('#situacao-lista');
  ok((await p.textContent('#situacao-lista')).includes('2 túmulos e 1 ordem'), 'tela inicial mostra a lista guardada no aparelho');
  await p.screenshot({ path: __dirname + '/cem-prints/s-app-lista.png' });

  // 3. Sem internet: vistoria, aviso e ordem feita
  await p.ctx.setOffline(true); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = 'tumulo'; }); await p.waitForSelector('#codigo');
  await p.fill('#codigo', 'q01-a01-007'); await p.dispatchEvent('#codigo', 'change');
  ok((await p.textContent('#achado')).includes('Aléia 01 · Nº 007'), 'sem internet: código conferido pela lista do aparelho');
  await p.evaluate(async (f) => {
    await salvarRegistro('tumulo', { fotos: [f], gps: null }, { codigo: 'Q01-A1-7', cadastrado: true, estrutura: '3', limpeza: '4', identificacao: '3', tampa: '1', sinaisDeVisita: 'Não', observacao: '' });
    await salvarRegistro('ocorrencia', { fotos: [f], gps: null }, { codigo: 'Q01-A1-7', cadastrado: true, tipoOrdem: 'acidente', descricao: 'Lápide caída' });
  }, FOTO);
  await p.evaluate(() => { location.hash = 'ordens'; }); await p.waitForSelector('[data-ordem]');
  await p.click('[data-ordem="OS1"]'); await p.fill('#nota', 'Limpo');
  await p.evaluate((f) => { /* foto direto no estado: o seletor de arquivos é testado na demonstração */ }, FOTO);
  await p.setInputFiles('#fotos', { name: 'f.png', mimeType: 'image/png', buffer: Buffer.from(FOTO.split(',')[1], 'base64') }); await p.waitForSelector('#previa-fotos img');
  await p.click('#salvar'); await p.waitForTimeout(400);
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '0', 'sem internet: nada no banco ainda');

  // 4. Internet volta → envio automático
  await p.ctx.setOffline(false);
  await p.waitForFunction(() => false, null, { timeout: 4000 }).catch(() => {});
  for (let i = 0; i < 20 && sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") !== '3'; i++) await p.waitForTimeout(500);
  ok(sql("select count(*) from cemiterio.docs where colecao='registrosCampo'") === '3', 'internet voltou: 3 registros enviados');

  // 5. Gestão confere
  await g.goto('http://localhost:8765/cemiterio/gestao/#vistorias/recebidos'); await g.reload(); await pronto(g);
  ok((await g.$$('#tab-recebidos tbody tr')).length === 3, 'Gestão: 3 registros aguardando conferência');
  ok(sql("select count(*) from cemiterio.docs where colecao='vistorias'") === '0', 'nada lançado antes da conferência');
  await g.screenshot({ path: __dirname + '/cem-prints/s-gestao-recebidos.png' });
  await g.click('#tab-recebidos [data-marcar-todos]'); await g.click('#barra-rec [data-confirmar-rec]');
  await g.waitForSelector('dialog.janela[open] .resultado-numeros');
  const txt = (await g.textContent('dialog.janela[open]')).replace(/\s+/g, ' ');
  ok(/Deram certo ?3/.test(txt), 'conferência: 3 lançados → ' + txt.slice(0, 160));
  await g.click('dialog.janela[open] footer button:has-text("Fechar")');
  ok(sql("select count(*) from cemiterio.docs where colecao='vistorias' and dados->>'tumuloId'='T1'") === '1', 'vistoria gravada no túmulo Q01-A1-7');
  ok(sql("select dados->>'situacao' from cemiterio.docs where colecao='ordensServico' and id='OS1'") === 'concluida', 'ordem 1/2026 concluída pelo aplicativo');
  ok(sql("select count(*) from cemiterio.docs where colecao='ordensServico' and dados->>'origem'='campo'") === '1', 'aviso virou ordem de serviço');
  const v = JSON.parse(sql("select dados from cemiterio.docs where colecao='vistorias'"));
  ok(v.fotos.length === 1 && v.fotos[0].caminho && !v.fotos[0].dataURL, 'foto da vistoria aponta para o arquivo já enviado (sem copiar a imagem)');
  ok(sql("select count(*) from cemiterio.docs where colecao='tumulos' and id='T1' and dados ? 'situacao'") === '0', 'situação do túmulo NÃO mudou sozinha');
  await g.goto('http://localhost:8765/cemiterio/gestao/#tumulo/T1'); await g.waitForTimeout(500);
  ok((await g.textContent('#conteudo')).includes('Indício de abandono'), 'ficha mostra a sugestão de Indício');
  ok((await g.$$('#conteudo .miniaturas img')).length >= 1, 'foto da vistoria aparece na ficha (link temporário)');
  await g.screenshot({ path: __dirname + '/cem-prints/s-ficha.png', fullPage: true });

  // 6. Papel consulta: não vê os botões de decisão; banco recusa se tentar
  const q = await nova({ viewport: { width: 1440, height: 900 } });
  await entrar(q, 'caio@ex.gov.br'); await q.waitForURL('**/cemiterio/gestao/**'); await pronto(q);
  await q.goto('http://localhost:8765/cemiterio/gestao/#tumulo/T1'); await q.waitForTimeout(400);
  ok(!(await q.isVisible('[data-e2="situacao"]')) && !(await q.isVisible('[data-e2="vistoria"]')), 'consulta não vê os botões de vistoria e situação');
  const recusa = await q.evaluate(async () => { try { const t = VP.db.pega('tumulos', 'T1'); t.situacao = 'indicio'; await VP.db.gravar('tumulos', t); return 'gravou'; } catch (e) { return e.message; } });
  ok(recusa !== 'gravou', 'consulta: banco recusa mudar a situação → ' + recusa.slice(0, 80));

  ok(erros.length === 0, 'sem erros: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
