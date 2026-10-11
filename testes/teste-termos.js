// Recebimento e termo de responsabilidade com prazo (sem e-mail): exemplo do usuário (Fernando recebe; João na Saúde; depois Josélia no CRAS).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) falhas++; };
fs.writeFileSync('/tmp/recebimento-ficticio.jpg', Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64'));
fs.writeFileSync('/tmp/termo-assinado-ficticio.pdf', '%PDF-1.4\n% termo FICTÍCIO\n%%EOF\n');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' })).newPage();
  const erros = [];
  p.on('pageerror', (e) => { erros.push(e.message); console.log('   ERRO', e.stack.split('\n').slice(0, 4).join(' | ')); });
  const J = (f, a) => p.evaluate(f, a);
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/'); await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  // responsáveis fictícios
  const ids = await J(async () => {
    const r = [{ id: 'RJ', nome: 'João (fictício)', matricula: '1' }, { id: 'RS', nome: 'Josélia (fictícia)', matricula: '2' }];
    await VP.db.gravar('responsaveis', r);
    const un = VP.db.lista('unidades');
    const bem = VP.db.lista('bens').filter((x) => x.tipo === 'movel' && x.status === 'ativo')[30];
    return { bem: bem.id, u1: un[2].id, u2: un[4].id };
  });
  ok(await J(() => VP.config().prazoTermoDias === 15), 'prazo padrão do termo: 15 dias (Configurações)');
  // recebimento com foto
  await ir('bem/' + ids.bem);
  await p.click('.barra-acoes [data-acao="recebimento"]'); await p.waitForSelector(dlg);
  await p.fill(`${dlg} [name="recebidoPor"]`, 'Fernando (fictício)'); await p.fill(`${dlg} [name="documento"]`, 'NF 123 (fictícia)');
  await p.setInputFiles(`${dlg} [name="arquivos"]`, '/tmp/recebimento-ficticio.jpg');
  await botaoDlg('Registrar'); await p.waitForTimeout(700);
  const rc = await J((id) => { const b = VP.db.pega('bens', id); return { por: b.recebimento?.por, ev: VP.eventosDoBem(id).some((e) => e.tipo === 'recebimento' && /Fernando/.test(e.descricao)), anexo: (b.anexos || []).some((a) => /Recebimento assinado por Fernando/.test(a.descricao || '')) }; }, ids.bem);
  ok(rc.por === 'Fernando (fictício)' && rc.ev && rc.anexo, 'recebimento: quem recebeu, no histórico, com a foto do documento assinado anexada');
  // troca de responsável → termo aguardando
  await p.click('[data-editar="local"]'); await p.waitForSelector(dlg);
  await p.selectOption(`${dlg} [name="unidadeId"]`, ids.u1).catch(() => {});
  await p.selectOption(`${dlg} [name="responsavelId"]`, 'RJ');
  await botaoDlg('Salvar'); await p.waitForTimeout(600);
  let t = await J((id) => VP.termos.doBem(id), ids.bem);
  ok(t.length === 1 && t[0].responsavelId === 'RJ' && t[0].situacao === 'aguardando' && t[0].prazo === await J(() => VP.u.somaDias(VP.Plataforma.hoje(), 15)), 'responsável João: termo aberto, aguardando assinatura, prazo de 15 dias');
  ok((await p.textContent('#conteudo')).includes('aguardando assinatura'), 'ficha mostra a pendência do termo');
  ok(await J(() => VP.pendencias().some((x) => x.chave === 'termos-aguardando')), 'pendência "Termos aguardando assinatura" no painel');
  // transferência para Josélia: termo do João (não assinado) é cancelado e abre outro
  await J(async (x) => { const t = { id: 'TT1', tipo: 'interna', bens: [x.bem], origens: {}, destinoUnidadeId: x.u2, responsavelDestinoId: 'RS', data: VP.Plataforma.hoje(), situacao: 'pendente' }; await VP.db.gravar('transferencias', t); await VP.bensAcoes?.efetivarTransferencia?.(t); }, ids).catch(() => {});
  const viaTela = await J(() => typeof VP.bensAcoes?.efetivarTransferencia === 'function');
  if (!viaTela) {
    await ir('bem/' + ids.bem);
    await p.click('.barra-acoes [data-acao="transferir"]'); await p.waitForSelector(dlg);
    await p.selectOption(`${dlg} [name="tipo"]`, 'interna'); await p.selectOption(`${dlg} [name="destinoUnidadeId"]`, ids.u2); await p.selectOption(`${dlg} [name="responsavelDestinoId"]`, 'RS');
    await botaoDlg('Transferir'); await p.waitForSelector(`${dlg} .resultado-numeros`); await botaoDlg('Fechar'); await p.waitForTimeout(400);
    // se a configuração exige aceite, aceita pela tela de transferências
    const pend = await J(() => VP.db.lista('transferencias').find((x) => x.situacao === 'pendente')?.id);
    if (pend) { await ir('transferencias'); const btn = await p.$('[data-aceitar], button:has-text("Aceitar")'); if (btn) { await btn.click(); await p.waitForTimeout(300); if (await p.$(dlg)) await p.click(`${dlg} footer button.primario, ${dlg} footer button:has-text("Aceitar")`); await p.waitForTimeout(600); } }
  }
  const tt = await J((id) => VP.termos.lista().filter((x) => x.bens.includes(id)).map((x) => `${x.responsavelId}:${x.situacao}`), ids.bem);
  console.log('   termos do bem:', JSON.stringify(tt));
  ok(tt.includes('RJ:cancelado') && tt.includes('RS:aguardando'), 'transferido para Josélia antes de João assinar: termo do João cancelado, novo termo da Josélia aguardando');
  // vencido
  await J(async (id) => { const x = VP.termos.doBem(id)[0]; x.prazo = '2020-01-01'; await VP.db.gravar('termosResp', x); }, ids.bem);
  ok(await J(() => VP.pendencias().some((x) => x.chave === 'termos-vencidos' && x.nivel === 'critico')), 'termo fora do prazo vira pendência grave ("vencidos")');
  // anexar assinado pela tela Termos
  await ir('termos');
  ok((await p.textContent('#conteudo')).includes('Josélia') && !!(await p.$('#menu a[data-rota="termos"]')), 'menu e tela Termos');
  await p.click('[data-termo-ass]'); await p.waitForSelector(dlg);
  await p.setInputFiles(`${dlg} [name="arquivos"]`, '/tmp/termo-assinado-ficticio.pdf');
  await botaoDlg('Anexar e fechar a pendência'); await p.waitForTimeout(800);
  const fim = await J((id) => ({ ag: VP.termos.doBem(id).length, anexo: (VP.db.pega('bens', id).anexos || []).some((a) => a.tipoAnexo === 'Termo de responsabilidade assinado'), pend: VP.pendencias().some((x) => x.chave === 'termos-vencidos') }), ids.bem);
  ok(fim.ag === 0 && fim.anexo && !fim.pend, 'termo assinado anexado: fica na ficha do bem e a pendência fecha');
  ok(erros.length === 0, 'sem erros ' + JSON.stringify(erros));
  console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU'); await b.close(); process.exit(falhas ? 1 : 0);
})();
