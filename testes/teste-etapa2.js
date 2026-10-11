// Teste da etapa 2 do cemitério (modo demonstração, cópia em /tmp/vp-copia na porta 8765)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/cem-prints';
fs.mkdirSync(O, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(350); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  const nv = await J(() => VP.db.lista('vistorias').length);
  const nos = await J(() => VP.db.lista('ordensServico').length);
  ok(nv > 50 && nos > 0, `semente fictícia com vistorias (${nv}) e ordens (${nos})`);

  // ----- regras (sem tela)
  const r = await J(() => {
    const t = VP.db.lista('tumulos').find((x) => !VP.vistoriasDe(x.id).length);
    const v = (data, n, v5) => ({ id: VP.u.id(), tumuloId: t.id, data, v1: n, v2: n, v3: n, v4: n, v5, fotos: [], origem: 'gestao', criadoEm: new Date().toISOString() });
    const out = {};
    out.sem = VP.sugestaoTriagem(t).nivel;
    VP.db.dados.vistorias.set('x1', Object.assign(v('2026-01-10', '1', 'sim'), { id: 'x1' })); VP.invalidar();
    out.leve = VP.sugestaoTriagem(t).nivel;
    VP.db.dados.vistorias.set('x2', Object.assign(v('2026-03-10', '3', 'sim'), { id: 'x2' })); VP.invalidar();
    out.comVisita = VP.sugestaoTriagem(t).nivel;
    VP.db.dados.vistorias.set('x3', Object.assign(v('2026-04-10', '3', 'nao'), { id: 'x3' })); VP.invalidar();
    out.indicio = VP.sugestaoTriagem(t).nivel;
    out.faltasRegular = VP.requisitosApuracao(t).length;
    t.situacao = 'indicio';
    out.faltasSemDoc = VP.requisitosApuracao(t);
    t.indicadores = ['D5'];
    out.faltasSoD5 = VP.requisitosApuracao(t).length;
    t.indicadores = ['D2'];
    out.faltasOk = VP.requisitosApuracao(t);
    t.excecaoHistorica = true;
    out.faltasHist = VP.requisitosApuracao(t).length;
    // desfaz (só na memória)
    for (const k of ['x1', 'x2', 'x3']) VP.db.dados.vistorias.delete(k);
    delete t.situacao; delete t.indicadores; delete t.excecaoHistorica; VP.invalidar();
    out.codigo = VP.codigoTumulo(t);
    out.achou = VP.acharPorCodigo(out.codigo.toLowerCase())?.id === t.id;
    return out;
  });
  ok(r.sem === 'regular' && r.leve === 'regular', 'sem vistoria ou nota baixa → sugere Regular');
  ok(r.comVisita === 'atencao', 'nota alta COM sinais de visita → só Atenção');
  ok(r.indicio === 'indicio', 'nota alta SEM sinais de visita → Indício');
  ok(r.faltasSemDoc.some((f) => /indicador documental/.test(f)) && !r.faltasSemDoc.some((f) => /2 vistorias|dias/.test(f)), 'apuração: 3 vistorias em 90 dias passam; falta indicador documental');
  ok(r.faltasSoD5 === 1, 'apuração: D5 sozinho não conta');
  ok(r.faltasOk.length === 0, 'apuração: requisitos atendidos com D2');
  ok(r.faltasHist === 1, 'apuração: exceção histórica bloqueia');
  ok(r.achou, `código achado sem diferença de maiúsculas (${r.codigo})`);

  // ----- telas abrem sem erro
  for (const h of ['vistorias', 'vistorias/recebidos', 'triagem', 'ordens', 'relatorio/triagem', 'painel', 'relatorios', 'lixeira', 'configuracoes']) {
    await ir(h);
    const t = await p.textContent('#titulo-tela');
    ok(t && !/errado/.test(t), `tela #${h} abre ("${t}")`);
  }
  await ir('painel'); await p.screenshot({ path: O + '/e2-painel.png', fullPage: true });

  // ----- mapa por situação
  await ir('mapa');
  await p.selectOption('[data-modo]', 'situacao'); await p.waitForTimeout(300);
  ok((await p.textContent('.legenda')).includes('Indício de abandono'), 'mapa colorido por situação');
  await p.selectOption('[data-modo]', 'vistoria'); await p.waitForTimeout(300);
  ok((await p.textContent('.legenda')).includes('Com risco'), 'mapa colorido por vistoria');
  await p.screenshot({ path: O + '/e2-mapa-vistoria.png' });

  // ----- ficha: nova vistoria com risco → oferece ordem
  const tid = await J(() => VP.db.lista('tumulos').find((x) => !VP.vistoriasDe(x.id).length && !VP.ordensDe(x.id).length).id);
  await ir('tumulo/' + tid);
  await p.click('[data-e2="vistoria"]');
  await p.waitForSelector(dlg);
  for (const [k, v] of [['v1', '4'], ['v2', '4'], ['v3', '3'], ['v4', '2'], ['v5', 'nao']]) await p.selectOption(`${dlg} [name=${k}]`, v);
  await botaoDlg('Salvar');
  await p.waitForSelector(`${dlg} footer button:has-text("Abrir ordem")`, { timeout: 5000 });
  ok(true, 'vistoria com estrutura 4 oferece abrir ordem de serviço');
  await botaoDlg('Abrir ordem');
  await p.waitForSelector(`${dlg} [name=descricao]`);
  ok((await p.inputValue(`${dlg} [name=prioridade]`)) === 'urgente', 'ordem já vem como urgente e conserto');
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const f1 = await J((id) => ({ v: VP.vistoriasDe(id).length, o: VP.ordensDe(id).length, sug: VP.sugestaoTriagem(VP.db.pega('tumulos', id)).nivel, sit: VP.situacaoAtual(VP.db.pega('tumulos', id)) }), tid);
  ok(f1.v === 1 && f1.o === 1, 'vistoria e ordem gravadas');
  ok(f1.sug === 'indicio' && f1.sit === 'regular', 'sistema SUGERE indício mas NÃO muda a situação sozinho');
  await ir('tumulo/' + tid);
  await p.screenshot({ path: O + '/e2-ficha.png', fullPage: true });

  // ----- mudar situação: apuração barrada
  await p.click('[data-e2="situacao"]'); await p.waitForSelector(dlg);
  await p.selectOption(`${dlg} [name=para]`, 'apuracao'); await p.fill(`${dlg} [name=motivo]`, 'teste'); await p.fill(`${dlg} [name=processo]`, '1/2026'); await p.fill(`${dlg} [name=revisor]`, 'Comissão');
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  const erroForm = await p.textContent(`${dlg} .erro-form`);
  ok(/Ainda não pode/.test(erroForm), 'apuração barrada sem os requisitos: ' + erroForm.slice(0, 90));
  await p.selectOption(`${dlg} [name=para]`, 'indicio');
  await botaoDlg('Salvar'); await p.waitForTimeout(400);
  ok(await J((id) => VP.situacaoAtual(VP.db.pega('tumulos', id)) === 'indicio' && VP.db.pega('tumulos', id).situacaoHist.length === 1, tid), 'pessoa decide: situação Indício gravada com histórico');

  // ----- indicadores
  await ir('tumulo/' + tid);
  await p.click('[data-e2="indicadores"]'); await p.waitForSelector(dlg);
  await p.check(`${dlg} [name=D3]`); await botaoDlg('Salvar'); await p.waitForTimeout(400);
  ok(await J((id) => VP.db.pega('tumulos', id).indicadores.join() === 'D3', tid), 'indicador documental D3 gravado');

  // ----- triagem: aceitar em lote
  await ir('triagem');
  const antes = await J(() => VP.db.lista('tumulos').filter(VP.sugestaoDiferente).length);
  await p.click('#tab-triagem [data-marcar-todos]'); await p.waitForTimeout(200);
  await p.click('#barra-tri [data-aceitar]'); await p.waitForSelector(dlg); await botaoDlg('Aceitar');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  await p.screenshot({ path: O + '/e2-triagem-resultado.png' });
  await fechar();
  const depois = await J(() => VP.db.lista('tumulos').filter(VP.sugestaoDiferente).length);
  ok(antes > 0 && depois === 0, `triagem em lote: ${antes} diferenças → ${depois}`);

  // ----- ordens: concluir
  await ir('ordens?situacao=aberta');
  await p.screenshot({ path: O + '/e2-ordens.png' });
  const oid = await J((id) => VP.ordensDe(id)[0].id, tid);
  await J((id) => VP.etapa2.verOrdem(VP.db.pega('ordensServico', id), () => VP.app.render()), oid);
  await p.waitForSelector(dlg); await botaoDlg('Concluir');
  await p.waitForSelector(`${dlg} [name=nota]`); await p.fill(`${dlg} [name=nota]`, 'Consertado');
  await p.setInputFiles(`${dlg} [name=fotos]`, { name: 'f.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') });
  await botaoDlg('Concluir'); await p.waitForTimeout(600);
  const o = await J((id) => VP.db.pega('ordensServico', id), oid);
  ok(o.situacao === 'concluida' && o.fotosConclusao.length === 1 && o.historico.length === 2, 'ordem concluída com foto e histórico');

  // ----- recebidos do aplicativo: importar arquivo, corrigir código, confirmar e desfazer
  const cod = await J((id) => VP.codigoTumulo(VP.db.pega('tumulos', id)), tid);
  const arq = [
    { id: 'r1', tipo: 'tumulo', criadoEm: '2026-10-01T10:00:00.000Z', gps: null, fotos: [], dados: { codigo: cod, estrutura: '1', limpeza: '2', identificacao: '0', tampa: '0', sinaisDeVisita: 'Sim', observacao: 'campo' }, situacao: 'aguardando', historico: [] },
    { id: 'r2', tipo: 'tumulo', criadoEm: '2026-10-01T11:00:00.000Z', gps: null, fotos: [], dados: { codigo: 'Q99-ERRADO', estrutura: '0', limpeza: '0', identificacao: '0', tampa: '0', sinaisDeVisita: 'Não' }, situacao: 'aguardando', historico: [] },
    { id: 'r3', tipo: 'ocorrencia', criadoEm: '2026-10-01T12:00:00.000Z', gps: null, fotos: [], dados: { codigo: cod, tipoOrdem: 'acidente', descricao: 'Lápide caída' }, situacao: 'aguardando', historico: [] },
    { id: 'r4', tipo: 'tumulo', criadoEm: '2026-10-01T13:00:00.000Z', gps: null, fotos: [], dados: { codigo: cod }, situacao: 'lixeira', historico: [] }];
  fs.writeFileSync('/tmp/registros-app.json', JSON.stringify(arq));
  await ir('vistorias/recebidos');
  await p.setInputFiles('[data-arquivo-app]', '/tmp/registros-app.json');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  const nums = await p.$$eval(`${dlg} .resultado-numeros strong`, (e) => e.map((x) => x.textContent));
  ok(nums[0] === '3' && nums[1] === '1', `arquivo do aplicativo: 3 recebidos, 1 recusado (Lixeira) → ${nums}`);
  await fechar();
  ok(await J(() => VP.db.lista('vistorias').filter((v) => v.registroCampoId).length === 0), 'nada entra no túmulo antes da conferência');
  await p.screenshot({ path: O + '/e2-recebidos.png', fullPage: true });
  await p.click('#tab-recebidos [data-marcar-todos]'); await p.waitForTimeout(200);
  await p.click('#barra-rec [data-confirmar-rec]');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  const n2 = await p.$$eval(`${dlg} .resultado-numeros strong`, (e) => e.map((x) => x.textContent));
  ok(n2[0] === '2' && n2[1] === '1', `confirmação: 2 lançados, 1 com código errado ficou → ${n2}`);
  await fechar();
  // corrige o código errado na própria grade
  await p.fill('[data-codigo="r2"]', cod); await p.press('[data-codigo="r2"]', 'Tab'); await p.waitForTimeout(400);
  ok((await p.textContent('#tab-recebidos')).includes('Aléia'), 'código corrigido na grade acha o túmulo');
  await p.click('#tab-recebidos [data-marcar-todos]'); await p.click('#barra-rec [data-confirmar-rec]');
  await p.waitForSelector(`${dlg} .resultado-numeros`); await fechar();
  const fim = await J((id) => ({ v: VP.vistoriasDe(id).filter((v) => v.origem === 'campo').length, o: VP.ordensDe(id).filter((x) => x.origem === 'campo').length, pend: VP.registrosParaConferir().length }), tid);
  ok(fim.v === 2 && fim.o === 1 && fim.pend === 0, `lançados no túmulo: ${fim.v} vistorias do campo, ${fim.o} ordem do aviso`);
  // desfazer
  p.once('dialog', () => {});
  await p.click('[data-desfazer-rec]'); await p.waitForSelector(dlg); await botaoDlg('Desfazer'); await p.waitForTimeout(500);
  ok(await J(() => VP.registrosParaConferir().length === 1 && VP.db.lista('vistorias', true).some((v) => v.registroCampoId && v.excluido)), 'desfazer: lançamento vai para a Lixeira e registro volta para conferência');

  // ----- Lixeira mostra
  await ir('lixeira');
  ok((await p.textContent('#area-lix')).includes('Vistoria') || (await p.textContent('#area-lix')).includes('Ordem'), 'Lixeira mostra vistoria/ordem excluída');

  // ----- recarregar: dados persistem
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true);
  ok(await J((id) => VP.situacaoAtual(VP.db.pega('tumulos', id)) !== 'regular' && VP.vistoriasDe(id).length >= 2, tid), 'depois de recarregar, situação e vistorias continuam');

  // ----- celular
  await p.setViewportSize({ width: 390, height: 844 });
  await ir('triagem'); await p.screenshot({ path: O + '/e2-triagem-celular.png' });
  const larg = await J(() => document.documentElement.scrollWidth);
  ok(larg <= 392, 'triagem no celular sem rolagem lateral da página (' + larg + ')');

  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
