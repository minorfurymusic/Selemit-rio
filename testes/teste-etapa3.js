// Etapa 3 do cemitério (demonstração): concessões, sepultamentos, exumações, ossário, agenda, vagas.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = __dirname + '/cem-prints';
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
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(400); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const erroForm = () => p.textContent(`${dlg} .erro-form`);
  const fechar = async () => { await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(200); };
  const preencher = async (o) => { for (const [k, v] of Object.entries(o)) { const el = await p.$(`${dlg} [name="${k}"]`); const tag = await el.evaluate((e) => e.tagName + e.type); if (tag.startsWith('SELECT')) await el.selectOption(v); else if (tag === 'INPUTcheckbox') { if (v) await el.check(); else await el.uncheck(); } else await el.fill(v); } };

  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'selemitério'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 60000 });
  const n = await J(() => ({ c: VP.db.lista('concessoes').length, s: VP.db.lista('sepultamentos').length, f: VP.db.lista('funerarias').length, nichos: VP.db.lista('tumulos').filter((t) => t.tipo === 'ossario').length, venc: VP.db.lista('concessoes').filter(VP.concessaoVencida).length, perm: VP.db.lista('sepultamentos').filter(VP.permanenciaVencida).length }));
  ok(n.c > 500 && n.s > 1000 && n.f === 2 && n.nichos === 60, 'semente fictícia: ' + JSON.stringify(n));
  ok(n.venc > 0 && n.perm > 0, 'há concessões vencidas e gavetas com permanência vencida na semente');

  // ----- regras
  const r = await J(() => {
    const out = {};
    out.soma = [VP.somaAnos('2020-02-29', 1), VP.somaAnos('2021-03-15', 5)];
    out.anos = [VP.anosEntre('2020-10-08', '2026-10-07'), VP.anosEntre('2020-10-07', '2026-10-07')];
    const c = VP.db.lista('concessoes').find(VP.concessaoVencida);
    const t = VP.db.pega('tumulos', c.tumuloId);
    out.d1 = VP.indicadoresDe(t).includes('D1') && !(t.indicadores || []).includes('D1');
    const sepNovo = VP.db.lista('sepultamentos').find((s) => s.situacao === 'sepultado' && VP.anosEntre(s.data, VP.Plataforma.hoje()) < 2);
    out.recente = VP.impedimentosExumacao(sepNovo, 'familia');
    out.recenteJudicial = VP.impedimentosExumacao(sepNovo, 'judicial');
    const sepAbandono = VP.db.lista('sepultamentos').find((s) => s.situacao === 'sepultado' && VP.anosEntre(s.data, VP.Plataforma.hoje()) >= 6);
    out.abandono = VP.impedimentosExumacao(sepAbandono, 'abandono');
    const perp = VP.db.lista('concessoes').find((x) => x.tipo === 'perpetua');
    const tp = VP.db.pega('tumulos', perp.tumuloId);
    out.perpetua = VP.requisitosApuracao(tp).some((f) => /perpétua/.test(f));
    return out;
  });
  ok(r.soma[0] === '2021-02-28' && r.soma[1] === '2026-03-15', 'soma de anos (29/02 vira 28/02): ' + r.soma);
  ok(r.anos[0] === 5 && r.anos[1] === 6, 'anos completos: ' + r.anos);
  ok(r.d1, 'concessão temporária vencida vira D1 sozinha (sem marcar à mão)');
  ok(r.recente.some((f) => /mínimo é 5 anos/.test(f)) && !r.recenteJudicial.some((f) => /mínimo/.test(f)), 'exumação antes de 5 anos barrada, exceto ordem judicial');
  ok(r.abandono.some((f) => /Abandono declarado/.test(f)), 'exumação por abandono só com abandono declarado');
  ok(r.perpetua, 'concessão perpétua barra "Abandono em apuração" enquanto a lei não for conferida');

  // ----- telas abrem
  for (const h of ['sepultamentos', 'sepultamentos/lista', 'concessoes', 'exumacoes', 'exumacoes/ossario', 'vagas', 'cadastros/funerarias', 'painel', 'configuracoes', 'lixeira']) {
    await ir(h); const t = await p.textContent('#titulo-tela'); ok(t && !/errado/.test(t), `tela #${h} abre ("${t}")`);
  }
  await ir('vagas'); await p.screenshot({ path: O + '/e3-vagas.png', fullPage: true });
  ok((await p.textContent('#corpo-relatorio')).includes('Quando acaba cada tipo'), 'painel de vagas com previsão');
  await ir('mapa'); await p.selectOption('[data-modo]', 'concessao'); await p.waitForTimeout(300);
  ok((await p.textContent('.legenda')).includes('Concessão vencida'), 'mapa colorido por concessão');
  await p.screenshot({ path: O + '/e3-mapa-concessao.png' });

  // ----- agenda: confirmar sepultamento agendado → túmulo ocupado
  await ir('sepultamentos'); await p.screenshot({ path: O + '/e3-agenda.png', fullPage: true });
  const ag = await J(() => VP.db.lista('sepultamentos').find((x) => x.situacao === 'agendado'));
  // agendado é amanhã: o botão existe; confirmar
  await p.click(`[data-confirmar-sep="${ag.id}"]`); await p.waitForSelector(dlg); await botaoDlg('Confirmar sepultamento'); await p.waitForTimeout(500);
  ok(await J((id) => VP.db.pega('sepultamentos', id).situacao === 'sepultado' && VP.db.pega('tumulos', VP.db.pega('sepultamentos', id).tumuloId).ocupacao === 'ocupado', ag.id), 'sepultamento confirmado: túmulo passa a Ocupado');

  // ----- agendar sepultamento em gaveta ocupada → barrado
  const gav = await J(() => { const t = VP.db.lista('tumulos').find((x) => x.tipo === 'gaveta' && VP.sepultadosAtivos(x.id).length); return VP.codigoTumulo(t); });
  await ir('sepultamentos'); await p.click('[data-agendar]'); await p.waitForSelector(dlg);
  await preencher({ codigo: gav, falecido: 'Teste Sabiá' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/Gaveta ocupada/.test(await erroForm()), 'gaveta ocupada não aceita novo sepultamento');
  await p.click(`${dlg} [data-fechar]`);

  // ----- túmulo vago: nova concessão + registrar sepultamento antigo
  const tid = await J(() => VP.db.lista('tumulos').find((x) => x.tipo === 'sepultura' && x.ocupacao === 'vago' && !VP.concessaoAtual(x.id) && !VP.sepultamentosDe(x.id).length).id);
  await ir('tumulo/' + tid);
  await p.click('[data-e3="concessao"]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'temporaria', inicio: '2015-01-10', titular: 'Titular Ipê Exemplo', cpf: '123' });
  await botaoDlg('Salvar'); await p.waitForTimeout(200);
  ok(/fim da concessão/.test(await erroForm()), 'temporária sem fim é barrada');
  await preencher({ fim: '2025-01-10' }); await botaoDlg('Salvar'); await p.waitForTimeout(200);
  ok(/CPF precisa/.test(await erroForm()), 'CPF inválido é barrado');
  await preencher({ cpf: '123.456.789-09' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const txtFicha = await p.textContent('#conteudo');
  ok(txtFicha.includes('***.456.789-**') && !txtFicha.includes('123.456.789-09'), 'CPF aparece mascarado na ficha');
  ok(txtFicha.includes('Temporária vencida'), 'ficha mostra concessão vencida');
  await p.click('[data-e3="registrar"]'); await p.waitForSelector(dlg);
  await preencher({ falecido: 'Falecido Jacarandá Exemplo', data: '2016-03-01', falecimento: '2016-02-28' });
  await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J((id) => VP.sepultadosAtivos(id).length === 1 && VP.db.pega('tumulos', id).ocupacao === 'ocupado', tid), 'sepultamento antigo registrado: túmulo passa a Ocupado');
  // busca pelo nome do falecido
  await p.fill('#busca-global', 'jacaranda exemplo falecido'); await p.press('#busca-global', 'Enter'); await p.waitForTimeout(500);
  ok((await p.$$('#tab-tumulos tbody tr.clicavel')).length === 1, 'busca pelo nome do falecido acha o túmulo');

  // ----- exumação: agendar (prazo: concessão temporária vencida) e registrar com ossário
  await ir('tumulo/' + tid);
  await p.click('[data-exumar]'); await p.waitForSelector(dlg);
  await preencher({ motivo: 'abandono', processo: '99/2026', dataPrevista: '2026-10-07' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/Abandono declarado/.test(await erroForm()), 'agendar por abandono sem declaração é barrado');
  await preencher({ motivo: 'prazo' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const ex = await J((id) => VP.exumacoesDe(id)[0], tid);
  ok(ex && ex.situacao === 'agendada' && ex.motivo === 'prazo', 'exumação agendada (concessão temporária vencida, 10 anos)');
  ok(await J((id) => VP.db.pega('tumulos', id).ocupacao === 'ocupado', tid), 'agendar não muda nada no túmulo');
  await ir('tumulo/' + tid);
  await p.click('[data-realizar-ex]'); await p.waitForSelector(dlg);
  await preencher({ responsavel: 'Coveiro Exemplo', testemunha1: 'Pessoa A', testemunha2: 'pessoa a', destino: 'ossario' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/testemunhas precisam ser pessoas diferentes/.test(await erroForm()), 'testemunhas iguais barradas');
  await preencher({ testemunha2: 'Pessoa B' }); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/nicho/.test(await erroForm()), 'ossário sem nicho barrado');
  const nicho = await p.$eval(`${dlg} [name=ossarioId] option:nth-child(2)`, (o) => o.value);
  await preencher({ ossarioId: nicho }); await botaoDlg('Salvar');
  await p.waitForSelector(`${dlg} .resultado-numeros`);
  await p.screenshot({ path: O + '/e3-exumacao-resultado.png' });
  await fechar();
  const fim = await J(([id, nid]) => ({ t: VP.db.pega('tumulos', id).ocupacao, n: VP.db.pega('tumulos', nid).ocupacao, restos: VP.restosNoOssario(nid).length, sep: VP.sepultamentosDe(id)[0].situacao, conc: VP.concessaoAtual(id)?.situacao }), [tid, nicho]);
  ok(fim.t === 'vago' && fim.n === 'ocupado' && fim.restos === 1 && fim.sep === 'exumado', 'exumação feita: túmulo vago, nicho ocupado com os restos ligados ao falecido: ' + JSON.stringify(fim));
  ok(fim.conc === 'vigente', 'concessão NÃO é encerrada sozinha');
  await ir('exumacoes/ossario');
  ok((await p.textContent('#tab-ossario')).includes('Falecido Jacarandá Exemplo'), 'ossário lista os restos com o nome');
  await p.screenshot({ path: O + '/e3-ossario.png' });
  // encerrar concessão
  await ir('tumulo/' + tid); await p.click('[data-e3="encerrar"]'); await p.waitForSelector(dlg);
  await preencher({ motivo: 'Processo 99/2026 concluído' }); await botaoDlg('Salvar'); await p.waitForTimeout(400);
  ok(await J((id) => !VP.concessaoAtual(id) && VP.concessoesDe(id)[0].situacao === 'encerrada', tid), 'pessoa encerra a concessão; fica no histórico');
  await p.screenshot({ path: O + '/e3-ficha.png', fullPage: true });

  // ----- linha do tempo e recarregar
  ok(await J((id) => ['concessao', 'sepultamento', 'exumacao'].every((k) => VP.db.lista('eventos').some((e) => e.tumuloId === id && e.tipo === k)), tid), 'linha do tempo com concessão, sepultamento e exumação');
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true);
  ok(await J((id) => VP.sepultamentosDe(id)[0].situacao === 'exumado', tid), 'depois de recarregar, tudo continua');

  await p.setViewportSize({ width: 390, height: 844 });
  await ir('vagas'); const larg = await J(() => document.documentElement.scrollWidth);
  ok(larg <= 392, 'painel de vagas no celular sem rolagem lateral (' + larg + ')');
  for (const h of ['tumulo/' + tid, 'sepultamentos', 'exumacoes', 'concessoes']) { await ir(h); const w = await J(() => document.documentElement.scrollWidth); ok(w <= 392, `#${h.split('/')[0]} no celular sem rolagem lateral (${w})`); }
  await ir('tumulo/' + tid); await p.screenshot({ path: O + '/e3-ficha-celular.png', fullPage: true });
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
