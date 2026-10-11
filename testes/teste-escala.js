// Escala de estado (8 níveis) com conversão única, Inservível/Imprestável, "A classificar" deprecia, classificador (item de controle × plaqueta).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/escala-prints'; fs.mkdirSync(O, { recursive: true });
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
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  const recarregar = async () => { await p.reload(); await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 }); };
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });

  // 1) exemplos já na escala nova
  const e1 = await J(() => ({ meta: VP.db.pega('meta', 'escalaEstados'), fora: VP.db.lista('bens').filter((b) => !(b.estado >= 1 && b.estado <= 8)).length, nomes: Object.values(VP.LISTAS.estados).join(',') }));
  ok(e1.meta?.versao === 2 && e1.fora === 0, 'dados de exemplo convertidos para a escala de 8 e marcados (uma vez só)');
  ok(e1.nomes === 'Imprestável,Péssimo,Ruim,Regular,Bom,Muito bom,Ótimo,Novo', 'escala: ' + e1.nomes);

  // 2) simula dados antigos (escala de 6) e a marca ausente: converte ao abrir, uma vez só
  await J(async () => {
    const bs = VP.db.lista('bens');
    const a = bs[0], c = bs[1], d = bs[2];
    for (const x of [a, c, d]) delete x.escalaAntiga;
    a.estado = 6; c.estado = 1; d.estado = 4; // Novo, Péssimo, Bom (antigos)
    const ev = VP.novoEvento(a.id, 'vistoria', { descricao: 'vistoria antiga (teste)', extra: { estado: 3 } });
    const inv = { id: 'INV-TESTE', nome: 'Inventário antigo (teste)', situacao: 'encerrado', esperados: {}, leituras: { [a.id]: { unidadeId: a.unidadeId, data: '2026-01-10', estado: 5, origem: 'manual' } }, sobras: [] };
    const ctl = VP.db.lista('bensControle')[0]; delete ctl.escalaAntiga; ctl.estado = 6;
    await VP.db.gravarVarias({ bens: [a, c, d], eventos: [ev], inventarios: [inv], bensControle: [ctl], meta: [{ id: 'escalaEstados', versao: 1 }] });
    window.__t = { a: a.id, c: c.id, d: d.id, ev: ev.id, ctl: ctl.id };
  });
  const ids = await J(() => window.__t);
  await recarregar();
  const e2 = await J((t) => ({ a: VP.db.pega('bens', t.a), c: VP.db.pega('bens', t.c), d: VP.db.pega('bens', t.d), ev: VP.db.pega('eventos', t.ev), inv: VP.db.pega('inventarios', 'INV-TESTE'), ctl: VP.db.pega('bensControle', t.ctl), meta: VP.db.pega('meta', 'escalaEstados') }), ids);
  ok(e2.a.estado === 8 && e2.c.estado === 2 && e2.d.estado === 5, `conversão 6→8 (Novo), 1→2 (Péssimo), 4→5 (Bom): ${e2.a.estado}, ${e2.c.estado}, ${e2.d.estado}`);
  ok(e2.a.escalaAntiga?.estado === 6 && e2.c.escalaAntiga?.estado === 1, 'valor antigo guardado no próprio bem');
  ok(e2.ev.dados.estado === 4 && e2.ev.dados.estadoEscalaAntiga === 3, 'estado gravado na vistoria convertido (3→4), antigo guardado');
  ok(e2.inv.leituras[ids.a].estado === 7 && e2.inv.leituras[ids.a].estadoEscalaAntiga === 5, 'leitura de inventário convertida (5→7)');
  ok(e2.ctl.estado === 8, 'item de controle convertido (6→8)');
  ok(e2.meta.versao === 2 && e2.meta.quantidade.bens >= 3, 'marca gravada com a quantidade convertida: ' + JSON.stringify(e2.meta.quantidade));
  await recarregar();
  const e3 = await J((t) => [VP.db.pega('bens', t.a).estado, VP.db.pega('bens', t.c).estado, VP.db.pega('bens', t.d).estado], ids);
  ok(e3.join() === '8,2,5', 'abrir de novo NÃO converte de novo: ' + e3.join());
  // registro do app de campo: antigo (sem escala) é convertido ao ler; novo (escala 8) não
  const campo = await J(() => [VP.estadoDoCampo({ estado: '6' }), VP.estadoDoCampo({ estado: '6', escala: 8 }), VP.estadoDoCampo({ estado: '1', escala: 8 })]);
  ok(campo.join() === '8,6,1', 'registro do app de campo: antigo convertido, novo como está: ' + campo.join());

  // 3) Imprestável: pendência e "Iniciar baixa" na ficha
  await J(async (t) => { const x = VP.db.pega('bens', t.d); x.estado = 1; await VP.db.gravar('bens', x); }, ids);
  ok(await J(() => VP.pendencias().some((x) => x.chave === 'imprestaveis' && x.qtd >= 1)), 'pendência "Bens imprestáveis aguardando baixa"');
  await ir('bem/' + ids.d);
  ok((await p.textContent('#conteudo')).includes('Imprestável') && !!(await p.$('.aviso-inline [data-acao="baixa"]')), 'ficha avisa "Imprestável" com o botão Iniciar baixa');
  await p.screenshot({ path: O + '/ficha-imprestavel.png' });
  await p.click('.aviso-inline [data-acao="baixa"]'); await p.waitForSelector(dlg);
  ok((await p.textContent(dlg)).includes('Baixa'), 'Iniciar baixa abre a janela de baixa');
  await botaoDlg('Cancelar');

  // 4) Inservível: situação (não estado)
  await ir('bem/' + ids.a);
  await p.click('.barra-acoes [data-acao="inservivel"]'); await p.waitForSelector(dlg);
  await p.selectOption(`${dlg} [name="motivo"]`, 'Antieconômico'); await p.fill(`${dlg} [name="laudo"]`, 'Laudo 12/2026 (teste)');
  await botaoDlg('Declarar inservível'); await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`); await botaoDlg('Fechar'); await p.waitForTimeout(400);
  const ins = await J((t) => ({ st: VP.db.pega('bens', t.a).status, ev: VP.eventosDoBem(t.a).find((e) => e.tipo === 'inservivel'), pend: VP.pendencias().some((x) => x.chave === 'inserviveis') }), ids);
  ok(ins.st === 'inservivel' && /Antieconômico/.test(ins.ev?.descricao) && ins.pend, 'Declarar inservível: situação muda, fica no histórico, aparece nas pendências');
  await ir('bem/' + ids.a);
  ok(!!(await p.$('.barra-acoes [data-acao="retorno"]')) && (await p.textContent('#conteudo')).includes('disponível para leilão'), 'ficha do inservível: aviso e botão Volta ao uso');
  await ir('bens/moveis?status=inservivel');
  ok((await p.textContent('#conteudo')).includes(e2.a.descricao), 'filtro da lista por situação Inservível');

  // 5) "A classificar" antiga (sem depreciação) é corrigida ao abrir
  await J(async () => { await VP.db.gravar('classificacoes', { id: 'AC-TESTE', codigo: 'AC-teste', nome: 'A classificar (importação) — Bens móveis (teste)', paiId: '', nivel: 'grupo', tipoBem: 'movel', naoDeprecia: true, vidaUtilMeses: 0, residualPct: 0, aClassificar: true }); });
  await recarregar();
  const ac = await J(() => VP.db.pega('classificacoes', 'AC-TESTE'));
  ok(ac.naoDeprecia === false && ac.vidaUtilMeses === 84 && ac.residualPct === 10 && ac.antesDemaisBens?.naoDeprecia === true, '"A classificar" antiga passa a depreciar como Demais bens (84 meses, 10%), antes guardado');

  // 6) classificador: regra valor × vida útil
  const an = await J(() => {
    const K = VP.classificador;
    const r = (descricao, valor) => { const a = K.analisar({ descricao, valor, tipo: 'movel' }); return a.sugestao + (a.certeza ? '' : '?'); };
    return { mouse: r('Mouse óptico USB', 25), mouseCaro: r('Mouse gamer', 450), cadeira: r('Cadeira escolar', 100), rodas: K.procurar('Cadeira de rodas adulto')?.nome, desconhecido: r('Coisa sem nome conhecido', 50), lista: VP.db.lista('vidaUtilItens').length };
  });
  console.log('   classificador:', JSON.stringify(an));
  ok(an.mouse === 'controle' && an.mouseCaro === 'patrimonio' && an.cadeira === 'patrimonio', 'R$ 25 e dura 12 meses → controle; R$ 450 → plaqueta; R$ 100 e dura 120 meses → plaqueta');
  ok(an.rodas === 'Cadeira de rodas' && an.desconhecido === 'patrimonio?' && an.lista >= 80, 'combinação mais longa ganha; desconhecido → plaqueta, pedindo conferência; lista inicial gravada');

  // 7) Novo bem: sugestão só quando barato E pouca durabilidade
  await ir('novo-bem/movel');
  await p.fill('#form-novo [name=descricao]', 'Mouse óptico USB'); await p.fill('#form-novo [name=valor]', '25'); await p.press('#form-novo [name=valor]', 'Tab'); await p.waitForTimeout(400);
  const dica1 = await p.textContent('#previa-novo');
  await p.fill('#form-novo [name=descricao]', 'Cadeira fixa'); await p.fill('#form-novo [name=valor]', '100'); await p.press('#form-novo [name=valor]', 'Tab'); await p.waitForTimeout(400);
  const dica2 = await p.textContent('#previa-novo');
  ok(/Sugestão: item de controle/.test(dica1) && !/item de controle/.test(dica2), 'Novo bem: sugere item de controle para mouse de R$ 25; nada para cadeira de R$ 100 (dura mais de 2 anos)');

  // 8) Nota fiscal com 10 itens: 4 baratos e de pouca duração já marcados como item de controle
  const antes = await J(() => ({ bens: VP.db.lista('bens').length, ctl: VP.db.lista('bensControle').length }));
  await p.setInputFiles('[data-nfe]', require('path').resolve(__dirname, '..') + '/patrimonio/gestao/exemplos/nfe-exemplo-itens-baratos.xml'); await p.waitForSelector(dlg);
  const sel = await p.$$eval('.item-nf [data-destino]', (els) => els.map((e) => e.value));
  ok(sel.length === 10 && sel.filter((x) => x === 'controle').length === 4 && sel.slice(0, 4).every((x) => x === 'controle'), 'nota com 10 itens: 4 (mouse, vassoura, balde, copo) já marcados como item de controle: ' + sel.join(','));
  ok((await p.textContent(dlg)).includes('4 de 10 item(ns)'), 'aviso no topo: 4 de 10 sugeridos');
  await p.screenshot({ path: O + '/nota-sugestao.png', fullPage: true });
  // a pessoa muda o copo para patrimônio
  await p.selectOption('.item-nf[data-i="3"] [data-destino]', 'patrimonio');
  for (let i = 3; i < 10; i++) { const v = await p.inputValue(`.item-nf[data-i="${i}"] [data-classe]`); if (!v) await p.fill(`.item-nf[data-i="${i}"] [data-classe]`, 'Monitores'); }
  await p.click(`${dlg} footer button:has-text("Incluir bens")`); await p.waitForSelector(`${dlg} footer button:has-text("Fechar")`);
  const res = (await p.textContent(dlg)).replace(/\s+/g, ' ');
  await botaoDlg('Fechar');
  const depois = await J(() => ({ bens: VP.db.lista('bens').length, ctl: VP.db.lista('bensControle').length, ctlNota: VP.db.lista('bensControle').filter((x) => x.nf?.numero === '7890').map((x) => `${x.descricao}:${x.quantidade}`), copo: VP.db.lista('bens').filter((b) => /Copo de vidro/.test(b.descricao)).length, dec: VP.db.lista('decisoesItens').map((d) => `${d.nome}=${d.escolha}`) }));
  console.log('   nota:', JSON.stringify(depois), res.slice(0, 200));
  ok(depois.ctl - antes.ctl === 3 && depois.ctlNota.join() === 'Mouse óptico USB:10,Vassoura de pelo:6,Balde plástico 10 L:6', '3 itens de controle criados (sem plaqueta), com a quantidade da nota');
  ok(depois.copo === 24 && depois.bens - antes.bens === 24 + 8 + 1 + 1 + 2 + 1 + 2, 'copo (mudado pela pessoa) e os outros 6 viraram bens com plaqueta: ' + (depois.bens - antes.bens));
  ok(depois.dec.includes('Copo de vidro 300 ml=patrimonio') && depois.dec.includes('Mouse óptico USB=controle') && !depois.dec.some((x) => /Notebook/.test(x)), 'decisões guardadas só dos itens baratos (o copo com a escolha da pessoa)');
  const apr = await J(() => VP.classificador.analisar({ descricao: 'Copo de vidro 300 ml', valor: 3.2, tipo: 'movel' }));
  ok(apr.sugestao === 'patrimonio' && /da última vez/.test(apr.motivo), 'aprendeu: da próxima vez o copo vem como patrimônio: ' + apr.motivo);

  // 9) Cadastros: lista de vida útil e decisões guardadas
  await ir('cadastros/vidaUtilItens');
  ok((await p.textContent('#conteudo')).includes('Fone de ouvido') && (await p.textContent('#conteudo')).includes('Até o limite de valor vira'), 'Cadastros → Vida útil dos itens (editável)');
  await ir('cadastros/decisoesItens');
  ok((await p.textContent('#conteudo')).includes('Copo de vidro 300 ml'), 'Cadastros → Decisões guardadas');
  await p.screenshot({ path: O + '/decisoes.png' });
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
