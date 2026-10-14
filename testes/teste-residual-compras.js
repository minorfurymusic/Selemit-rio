// Valor residual sempre pedido (R$ ou %), valor do bem nunca abaixo do residual nem negativo;
// compra com fornecedor novo cadastrado sozinho (à mão e pela planilha CSV) e entidade certa (não mais "E1" fixo).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.message); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });

  // 1) Novo bem: residual vem da classificação e é obrigatório
  await ir('novo-bem/movel');
  await p.fill('#f-descricao', 'Mesa de teste residual');
  await p.fill('#f-classificacao', 'Bens móveis › Mobiliário › Mesas'); await p.dispatchEvent('#f-classificacao', 'input');
  ok(await p.inputValue('#f-residual') === '10' && await p.inputValue('#f-residualTipo') === 'percentual', 'residual 10% preenchido pela classificação');
  await p.selectOption('#f-unidadeId', { index: 1 }); await p.fill('#f-valor', '1000');
  await p.fill('#f-residual', ''); await p.dispatchEvent('#f-residual', 'input');
  await p.click('#form-novo button[type=submit]'); await p.waitForTimeout(300);
  ok((await p.textContent('#form-novo .erro-form')).includes('Informe o Valor residual'), 'sem residual: não salva e pede o residual');
  await p.selectOption('#f-residualTipo', 'valor'); await p.fill('#f-residual', '1000');
  await p.click('#form-novo button[type=submit]'); await p.waitForTimeout(300);
  ok((await p.textContent('#form-novo .erro-form')).includes('menor que o valor de aquisição'), 'residual em R$ igual ao valor: recusado');
  await p.fill('#f-residual', '150');
  await p.click('#form-novo button[type=submit]'); await p.waitForTimeout(800);
  const bem = await J(() => VP.db.lista('bens').find((x) => x.descricao === 'Mesa de teste residual'));
  ok(bem && bem.depreciacao.residualTipo === 'valor' && bem.depreciacao.residual === 150, 'bem gravado com residual em dinheiro (R$ 150)');
  await J(() => { document.querySelectorAll('dialog.janela[open] footer button').forEach((x) => { if (/Fechar|Agora não/.test(x.textContent)) x.click(); }); });

  // 2) depreciando 30 anos: valor nunca abaixo do residual nem negativo
  const s = await J((id) => {
    const bem = VP.db.pega('bens', id);
    const ini = bem.depreciacao.inicio.slice(0, 7);
    let acum = 0, minimo = Infinity;
    // cada mês fechado vira um lançamento de depreciação; aqui só na memória (não grava nada)
    const evs = VP.eventosDoBem(bem.id);
    for (let i = 0; i < 360; i++) { const ym = VP.u.somaMeses(ini, i); const q = VP.quotaMes(bem, ym); evs.push({ tipo: 'depreciacao', valor: q, data: VP.u.fimDoMes(ym), criadoEm: '' }); acum += q; minimo = Math.min(minimo, VP.saldo(bem).liquido); }
    VP.invalidarIndice();
    return { acum: Math.round(acum * 100) / 100, minimo: Math.round(minimo * 100) / 100 };
  }, bem.id);
  ok(s.acum === 850 && s.minimo === 150, `depreciação total R$ ${s.acum} e menor valor R$ ${s.minimo} (para no residual)`);
  const s2 = await J(() => { const b = { id: 'X', depreciacao: { automatica: true, vidaUtilMeses: 12, residualTipo: 'valor', residual: 5000, inicio: '2026-01-01' } }; return VP.saldo(b); });
  ok(s2.liquido >= 0 && s2.depreciavel === 0, 'residual maior que o valor: nada a depreciar, nunca negativo');

  // 3) Classificações: vida útil sem residual é recusada
  await ir('cadastros/classificacoes');
  await p.click('[data-novo-cad]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="nome"]`, 'Grupo sem residual'); await p.fill(`${dlg} [name="vidaUtilMeses"]`, '60');
  await p.click(`${dlg} footer button:has-text("Salvar")`); await p.waitForTimeout(300);
  ok((await p.textContent(dlg)).includes('Informe o Valor residual'), 'classificação com vida útil e sem residual: recusada');
  await p.click(`${dlg} footer button:has-text("Cancelar")`);

  // 4) Compra à mão com fornecedor novo
  const antes = await J(() => VP.db.lista('fornecedores').length);
  await ir('entradas');
  await p.click('[data-novo-item]'); await p.waitForSelector(dlg);
  ok(!!(await p.$(`${dlg} [name="fornecedorNome"][list]`)), 'fornecedor da compra: campo de digitar com lista (completa e filtra)');
  await p.selectOption(`${dlg} [name="entidadeId"]`, { index: 1 }); await p.selectOption(`${dlg} [name="produtoId"]`, { index: 1 });
  await p.fill(`${dlg} [name="fornecedorNome"]`, 'Fornecedor Novo À Mão Ltda'); await p.fill(`${dlg} [name="fornecedorDoc"]`, '33.333.333/0001-33');
  await p.fill(`${dlg} [name="oc"]`, '77/2026'); await p.fill(`${dlg} [name="quantidade"]`, '1'); await p.fill(`${dlg} [name="valorUnitario"]`, '500');
  await p.click(`${dlg} footer button:has-text("Salvar")`); await p.waitForTimeout(600);
  const m = await J(() => { const f = VP.db.lista('fornecedores').find((x) => x.nome === 'Fornecedor Novo À Mão Ltda'); const it = VP.db.lista('itensIncorporar').find((x) => x.ordemCompra?.numero === '77'); return { f, it, n: VP.db.lista('fornecedores').length }; });
  ok(m.f && m.f.documento === '33.333.333/0001-33' && m.it && m.it.fornecedorId === m.f.id && m.n === antes + 1, 'compra à mão sem empenho: fornecedor novo cadastrado (com CNPJ) e ligado à compra');

  // 5) Planilha CSV de compras: fornecedor novo + entidade pelo nome (não mais "E1" fixo)
  const ent = await J(() => VP.db.lista('entidades')[1]);
  const prod = await J(() => VP.db.lista('produtos')[0].nome);
  await p.click('[data-importar-itens]'); await p.waitForSelector(dlg);
  const csv = `entidade;ordem_compra;empenho;emissao;fornecedor;cnpj_fornecedor;produto;quantidade;valor_unitario;liquidado\n${ent.nome};88/2026;;;Fornecedor da Planilha Ltda;44.444.444/0001-44;${prod};3;120;nao\n`;
  await p.setInputFiles(`${dlg} [data-arquivo]`, { name: 'compras.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) }); await p.waitForTimeout(400);
  ok((await p.textContent(`${dlg} [data-previa]`)).includes('1 linha(s) certa(s), 0 com erro'), 'CSV de compras: prévia sem erro');
  await p.click(`${dlg} footer button:has-text("Importar")`); await p.waitForTimeout(600);
  const c = await J((eid) => { const it = VP.db.lista('itensIncorporar').find((x) => x.ordemCompra?.numero === '88'); const f = VP.db.pega('fornecedores', it?.fornecedorId); return { ent: it?.entidadeId === eid, f: f && f.nome === 'Fornecedor da Planilha Ltda' && f.documento === '44.444.444/0001-44' }; }, ent.id);
  ok(c.ent && c.f, 'CSV de compras: entidade da planilha e fornecedor novo cadastrado');

  ok(erros.length === 0, 'sem erros na página: ' + JSON.stringify(erros));
  console.log(falhas ? `FALHARAM ${falhas}` : 'TUDO PASSOU');
  await b.close();
  process.exit(falhas ? 1 : 0);
})();
