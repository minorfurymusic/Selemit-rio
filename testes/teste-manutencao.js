// Etapa 6 do Patrimônio (demonstração): chamados, preventiva, vistorias e equipes.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const O = __dirname + '/gestao-teste';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
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
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  const g = await J(() => ({ ch: VP.db.lista('chamados').length, prev: VP.db.lista('chamados').filter((c) => c.origem === 'preventiva').map((c) => c.planoId) }));
  ok(g.prev.includes('PP1') && !g.prev.includes('PP3'), 'ao abrir, a preventiva vencida (ar-condicionado) virou chamado; a que está longe não: ' + JSON.stringify(g.prev));
  await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  ok(await J((n) => VP.db.lista('chamados').length === n, g.ch), 'abrir de novo não duplica o chamado preventivo');
  for (const h of ['manutencao', 'manutencao/chamados', 'manutencao/preventiva', 'manutencao/vistorias', 'manutencao/equipes']) { await ir(h); ok((await p.textContent('#titulo-tela')) === 'Manutenção', `tela #${h} abre`); }
  await ir('manutencao'); await p.screenshot({ path: O + '/manutencao-painel.png', fullPage: true });
  ok(await J(() => VP.pendencias().some((x) => x.chave === 'cham-atrasados')), 'central de pendências mostra chamados atrasados');

  // novo chamado de um bem
  const bem = await J(() => { const x = VP.db.lista('bens').find((b) => b.tipo === 'movel' && b.status === 'ativo'); return { id: x.id, codigo: x.codigo, unidadeId: x.unidadeId }; });
  await ir('manutencao/chamados');
  await p.click('[data-novo-chamado]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'conserto', unidadeId: bem.unidadeId, bem: '999999', descricao: 'Não liga' });
  await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/Bem não encontrado/.test(await erroForm()), 'código de bem inexistente é recusado');
  await preencher({ bem: String(bem.codigo), custoPrevisto: '250,00', prioridade: 'urgente' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  const cid = await J((id) => VP.db.lista('chamados').find((c) => c.bemId === id && c.descricao === 'Não liga').id, bem.id);
  ok(!!cid, 'chamado aberto ligado ao bem');
  // avançar: aberto → campo (exige equipe) → revisão → devolver → revisão → concluído
  const avancar = async (texto, dados) => { await J((id) => VP.manutencao.verChamado(VP.db.pega('chamados', id), () => VP.app.render()), cid); await p.waitForSelector(dlg); await botaoDlg(texto); await p.waitForSelector(`${dlg} .erro-form`); if (dados) await preencher(dados); await botaoDlg(texto); await p.waitForTimeout(400); };
  await J((id) => VP.manutencao.verChamado(VP.db.pega('chamados', id), () => VP.app.render()), cid); await p.waitForSelector(dlg); await botaoDlg('Em campo'); await p.waitForSelector(`${dlg} .erro-form`);
  await botaoDlg('Em campo'); await p.waitForTimeout(300);
  ok(/equipe ou o responsável/.test(await erroForm()), 'ir a campo exige equipe ou responsável');
  await preencher({ equipeId: 'EQ1' }); await botaoDlg('Em campo'); await p.waitForTimeout(400);
  await avancar('Em revisão', { nota: 'Trocada a fonte' });
  await J((id) => VP.manutencao.verChamado(VP.db.pega('chamados', id), () => VP.app.render()), cid); await p.waitForSelector(dlg);
  await botaoDlg('Devolver para a equipe'); await p.waitForSelector(`${dlg} [name=nota]`); await preencher({ nota: 'Ainda faz barulho' }); await botaoDlg('Devolver'); await p.waitForTimeout(400);
  ok(await J((id) => VP.db.pega('chamados', id).situacao === 'campo', cid), 'revisão não aprovada volta para "Em campo"');
  await avancar('Em revisão', { nota: 'Trocado o ventilador' });
  await avancar('Concluído', { nota: 'Testado e funcionando', custo: '310,50' });
  const fim = await J(([id, bid]) => { const c = VP.db.pega('chamados', id); const ev = VP.eventosDoBem(bid).find((e) => e.tipo === 'manutencao' && e.dados?.chamadoId === id); return { s: c.situacao, custo: c.custoRealizado, ev: ev?.valor, hist: c.historico.length }; }, [cid, bem.id]);
  ok(fim.s === 'concluido' && fim.custo === 310.5 && fim.ev === 310.5 && fim.hist === 6, 'concluído: custo no chamado e despesa na linha do tempo do bem: ' + JSON.stringify(fim));
  // concluir a preventiva atualiza o plano
  const pc = await J(() => VP.db.lista('chamados').find((c) => c.planoId === 'PP1').id);
  for (const [t, d] of [['Em campo', { equipeId: 'EQ2' }], ['Em revisão', { nota: 'feito' }], ['Concluído', { nota: 'Filtros limpos' }]]) { await J((id) => VP.manutencao.verChamado(VP.db.pega('chamados', id), () => VP.app.render()), pc); await p.waitForSelector(dlg); await botaoDlg(t); await p.waitForSelector(`${dlg} .erro-form`); await preencher(d); await botaoDlg(t); await p.waitForTimeout(400); }
  const pl = await J(() => { const x = VP.db.pega('planosPreventiva', 'PP1'); return { ultima: x.ultimaData, prox: VP.manutencao.proximaData(x), sit: VP.manutencao.situacaoPlano(x) }; });
  ok(pl.ultima === await J(() => VP.Plataforma.hoje()) && pl.sit === 'em-dia', 'preventiva concluída: plano marcado como feito hoje e volta a "em dia": ' + JSON.stringify(pl));
  // vistoria com não conformidade → chamado
  await ir('manutencao/vistorias');
  await p.click('[data-nova-vistoria]'); await p.waitForSelector(dlg);
  await preencher({ tipo: 'incendio', unidadeId: 'U1' }); await botaoDlg('Continuar');
  await p.waitForSelector(`${dlg} [name=i0]`);
  for (let i = 0; i < 6; i++) await p.selectOption(`${dlg} [name=i${i}]`, i === 1 ? 'nao' : i === 4 ? 'nao' : 'sim');
  await p.check(`${dlg} [name=c1]`);
  await botaoDlg('Salvar'); await p.waitForSelector(`${dlg} .resultado-numeros`);
  const txt = await p.textContent(dlg);
  ok(txt.includes('2 não conforme') && (txt.match(/Chamado .* aberto/g) || []).length === 1, 'vistoria: 2 não conformes, só 1 vira chamado (o marcado pela pessoa)');
  await fechar();
  // equipe
  await ir('manutencao/equipes');
  await p.click('[data-nova-equipe]'); await p.waitForSelector(dlg);
  await preencher({ nome: 'Equipe de teste' }); await botaoDlg('Salvar'); await p.waitForTimeout(300);
  ok(/pelo menos uma pessoa/.test(await erroForm()), 'equipe sem ninguém é recusada');
  await p.check(`${dlg} [name=m_R4]`); await botaoDlg('Salvar'); await p.waitForTimeout(400);
  ok(await J(() => VP.db.lista('equipes').some((e) => e.nome === 'Equipe de teste' && e.membros.join() === 'R4')), 'equipe criada');
  // plano novo vencido gera chamado na hora
  await ir('manutencao/preventiva');
  await p.click('[data-novo-plano]'); await p.waitForSelector(dlg);
  await preencher({ item: 'Revisão do para-raios (teste)', unidadeId: 'U2', cadaMeses: '12', ultimaData: '2025-01-01' }); await botaoDlg('Salvar'); await p.waitForTimeout(500);
  ok(await J(() => VP.db.lista('chamados').some((c) => c.origem === 'preventiva' && /para-raios/.test(c.descricao))), 'plano novo já vencido abre o chamado na hora');
  await ir('manutencao'); await p.screenshot({ path: O + '/manutencao-painel2.png', fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  for (const h of ['manutencao', 'manutencao/chamados', 'manutencao/preventiva']) { await ir(h); const w = await J(() => document.documentElement.scrollWidth); ok(w <= 392, `#${h} no celular sem rolagem lateral (${w})`); }
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
