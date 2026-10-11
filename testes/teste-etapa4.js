// Etapa 4 do cemitério (demonstração): processo administrativo do abandono.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = __dirname + '/cem-prints';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
const PNG = { name: 'placa.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(400); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const erroForm = () => p.textContent(`${dlg} .erro-form`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };
  const preencher = async (o) => { for (const [k, v] of Object.entries(o)) { const el = await p.$(`${dlg} [name="${k}"]`); const tag = await el.evaluate((e) => e.tagName + e.type); if (tag.startsWith('SELECT')) await el.selectOption(v); else if (tag === 'INPUTcheckbox') { if (v) await el.check(); else await el.uncheck(); } else if (tag === 'INPUTfile') await el.setInputFiles(v); else await el.fill(v); } };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  ok(await J(() => VP.db.lista('processos').length === 1), 'semente com 1 processo de exemplo');
  const r = await J(() => [VP.etapa4.somaDias('2026-10-09', 1, true), VP.etapa4.somaDias('2026-10-09', 5, true), VP.etapa4.somaDias('2026-10-09', 3, false)]);
  ok(r[0] === '2026-10-12' && r[1] === '2026-10-16' && r[2] === '2026-10-12', 'dias úteis pulam fim de semana: ' + r);

  // preparar um túmulo com indício + requisitos (2 vistorias com 100+ dias, indicador D2, concessão com telefone e sepultado antigo)
  const tid = await J(async () => {
    const t = VP.db.lista('tumulos').find((x) => x.tipo === 'sepultura' && x.ocupacao === 'ocupado' && !VP.vistoriasDe(x.id).length && VP.sepultadosAtivos(x.id).some((s) => VP.anosEntre(s.data, VP.Plataforma.hoje()) >= 6) && !VP.concessaoAtual(x.id));
    const v = (id, data) => ({ id, tumuloId: t.id, data, v1: '3', v2: '4', v3: '3', v4: '2', v5: 'nao', fotos: [], origem: 'gestao', criadoEm: new Date().toISOString() });
    t.situacao = 'indicio'; t.indicadores = ['D2'];
    await VP.db.gravarVarias({ tumulos: [t], vistorias: [v('pv1', '2026-03-01'), v('pv2', '2026-09-01')], concessoes: [{ id: 'pc1', numero: '900/2000', tumuloId: t.id, tipo: 'temporaria', inicio: '2000-01-01', fim: '2030-01-01', titular: 'Titular Manacá Exemplo', telefone: '(47) 99999-0000', email: 'titular@exemplo.invalid', situacao: 'vigente', historico: [] }] });
    return t.id;
  });
  await ir('tumulo/' + tid);
  await p.click('[data-e2="situacao"]'); await p.waitForSelector(dlg);
  ok(!(await p.$$eval(`${dlg} [name=para] option`, (o) => o.map((x) => x.value))).includes('declarado'), '"Abandono declarado" não aparece em Mudar situação (só pela decisão do processo)');
  await preencher({ para: 'apuracao', motivo: 'Duas vistorias ruins e taxas em aberto', processo: '55/2026', revisor: 'Comissão de teste' });
  await botaoDlg('Salvar'); await p.waitForTimeout(600);
  const pid = await J((id) => VP.processoAberto(id)?.id, tid);
  ok(!!pid && await J((id) => VP.situacaoAtual(VP.db.pega('tumulos', id)) === 'apuracao', tid), 'Abandono em apuração abre o processo 55/2026');
  await ir('tumulo/' + tid);
  await p.click('[data-e2="situacao"]'); await p.waitForTimeout(300);
  ok((await p.$$(dlg)).length === 0 && (await p.textContent('#aviso-rapido')).includes('processo 55/2026'), 'com processo aberto, a situação não muda por fora do processo');

  // detalhe do processo
  await ir('processos/' + pid);
  ok((await p.textContent('#titulo-tela')).includes('55/2026'), 'tela do processo abre');
  // decidir declarar logo → barrado
  await p.click('[data-p4="decidir"]'); await p.waitForSelector(dlg);
  await preencher({ resultado: 'declarado', fundamentacao: 'x', autoridade: 'Secretário', ato: '1', dataAto: '2026-10-01' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/Ainda não pode declarar/.test(await erroForm()), 'declarar sem notificação, aviso, edital e prazo é barrado');
  await p.click(`${dlg} [data-fechar]`);
  // notificação por WhatsApp: botões com o texto pronto
  await p.click('[data-p4="notificar"]'); await p.waitForSelector(dlg);
  const href = await p.getAttribute(`${dlg} a:has-text("Abrir no WhatsApp")`, 'href');
  ok(href.startsWith('https://wa.me/5547999990000?text=') && decodeURIComponent(href).includes('55/2026'), 'link do WhatsApp com o número e o texto da notificação');
  ok(!!(await p.$(`${dlg} a:has-text("Abrir no e-mail")`)), 'link do e-mail com o texto');
  await preencher({ meio: 'whatsapp', resultado: 'naoLocalizado' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('processos', id).notificacoes.length === 1, pid), 'notificação registrada (não localizado)');
  // aviso sem foto → barrado
  await ir('processos/' + pid);
  await p.click('[data-p4="aviso"]'); await p.waitForSelector(dlg);
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/foto/.test(await erroForm()), 'aviso no túmulo exige foto');
  await preencher({ fotos: PNG }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => !!VP.db.pega('processos', id).aviso, pid), 'aviso registrado com foto');
  // edital com data anterior à abertura → barrado
  await ir('processos');
  await p.click('[data-edital]'); await p.waitForSelector(dlg);
  await preencher({ numero: '6/2026', data: '2026-08-03' }); await botaoDlg('Registrar publicação'); await p.waitForTimeout(300);
  ok(/anterior à abertura/.test(await erroForm()), 'edital anterior à abertura do processo é barrado');
  await p.click(`${dlg} [data-fechar]`);
  // para testar o prazo vencido, o processo passa a ter sido aberto em julho (só na memória do teste)
  await J(async (id) => { for (const x of VP.db.lista('processos')) { x.abertoEm = '2026-07-01'; } await VP.db.gravar('processos', VP.db.lista('processos')); }, pid);
  // edital em lote (data antiga para o prazo já ter vencido)
  await ir('processos');
  await p.click('[data-edital]'); await p.waitForSelector(dlg);
  ok((await p.$$(`${dlg} [data-proc]`)).length === 2, 'edital lista os 2 processos sem edital');
  await preencher({ numero: '7/2026', data: '2026-08-03' });
  await botaoDlg('Registrar publicação');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  ok((await p.textContent(`${dlg} .texto-notificacao`)).includes('EDITAL Nº 7/2026'), 'texto do edital gerado');
  await fechar();
  const fase = await J((id) => { const x = VP.db.pega('processos', id); return [VP.etapa4.inicioPrazo(x), VP.etapa4.fimPrazo(x), VP.etapa4.fase(x)]; }, pid);
  ok(fase[0] === '2026-08-03' && fase[1] === '2026-09-14' && fase[2] === 'decisao', 'prazo de 30 dias úteis a partir do edital, já vencido: ' + fase);
  // defesa sem resposta bloqueia
  await ir('processos/' + pid);
  await p.click('[data-p4="manifestacao"]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'defesa', quem: 'Neto do falecido', texto: 'Pede mais tempo' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.etapa4.fase(VP.db.pega('processos', id)) === 'analise', pid), 'defesa recebida: fase "Análise de defesa"');
  await ir('processos/' + pid);
  await p.click('[data-responder]'); await p.waitForSelector(dlg);
  await preencher({ resposta: 'Sem documento que comprove vínculo; pedido negado.' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  // decisão: declarar sem ato → barrado; com ato → declarado
  await ir('processos/' + pid);
  await p.screenshot({ path: O + '/e4-processo.png', fullPage: true });
  await p.click('[data-p4="decidir"]'); await p.waitForSelector(dlg);
  await preencher({ resultado: 'declarado', fundamentacao: 'Vistorias, notificação, edital e prazo cumpridos.', autoridade: 'Secretário de Obras (exemplo)' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/nº do ato/.test(await erroForm()), 'declarar exige nº do ato e data');
  await preencher({ ato: 'Portaria 123/2026', dataAto: '2026-10-01' }); await botaoDlg('Salvar');
  await p.waitForSelector(`${dlg} .resultado-numeros`); await fechar();
  const fim = await J((id) => { const x = VP.db.pega('processos', id); return { s: x.situacao, r: x.resultado, t: VP.situacaoAtual(VP.db.pega('tumulos', x.tumuloId)) }; }, pid);
  ok(fim.s === 'encerrado' && fim.r === 'declarado' && fim.t === 'declarado', 'decisão registrada: túmulo "Abandono declarado": ' + JSON.stringify(fim));
  ok(await J((id) => { const s = VP.sepultadosAtivos(id)[0]; return VP.impedimentosExumacao(s, 'abandono').length === 0; }, tid), 'depois de declarado, exumação por abandono pode ser agendada (por uma pessoa)');
  const dossie = await J((id) => VP.etapa4.dossie(VP.db.pega('processos', id)), pid);
  const faltam = ['Vistorias', 'Notificações', 'Aviso no túmulo', 'Edital', 'Nº 7/2026', 'Manifestações', 'Neto do falecido', 'Decisão', 'Portaria 123/2026', 'Titular Manacá Exemplo', '<img'].filter((k) => !dossie.includes(k));
  ok(!faltam.length, 'dossiê com todas as partes e a foto da placa' + (faltam.length ? ' — faltam: ' + faltam : ''));

  // segundo processo (o de exemplo): termo de compromisso cumprido → regularizado
  const p2 = await J(() => VP.db.lista('processos').find((x) => x.situacao === 'andamento').id);
  await ir('processos/' + p2);
  await p.click('[data-p4="manifestacao"]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'termo', quem: 'Filha do titular', texto: 'Compromete-se a reformar a tampa', prazo: '2026-12-01' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  await ir('processos/' + p2);
  await p.click('[data-verificar-termo]'); await p.waitForSelector(dlg);
  await preencher({ cumprido: 'nao', nota: 'ainda não' }); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/ainda não terminou/.test(await erroForm()), '"não cumprido" antes do prazo é barrado');
  await preencher({ cumprido: 'sim', nota: 'Tampa refeita, foto anexada na vistoria' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  await ir('processos/' + p2);
  await p.click('[data-p4="decidir"]'); await p.waitForSelector(dlg);
  await preencher({ resultado: 'regularizado', fundamentacao: 'Termo cumprido', autoridade: 'Administrador do cemitério' }); await botaoDlg('Salvar');
  await p.waitForSelector(`${dlg} .resultado-numeros`); await fechar();
  ok(await J((id) => { const x = VP.db.pega('processos', id); return x.resultado === 'regularizado' && VP.situacaoAtual(VP.db.pega('tumulos', x.tumuloId)) === 'regular'; }, p2), 'termo cumprido → arquivado como regularizado, túmulo volta a Regular');

  await ir('processos'); await p.screenshot({ path: O + '/e4-lista.png', fullPage: true });
  await ir('painel');
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true);
  ok(await J(() => VP.db.lista('processos').filter((x) => x.situacao === 'encerrado').length === 2), 'depois de recarregar, os 2 processos continuam encerrados');
  await p.setViewportSize({ width: 390, height: 844 });
  for (const h of ['processos', 'processos/' + pid]) { await ir(h); const w = await J(() => document.documentElement.scrollWidth); ok(w <= 392, `#${h} no celular sem rolagem lateral (${w})`); }
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
