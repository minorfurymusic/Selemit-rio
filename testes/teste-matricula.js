// Leitura da matrícula (PDF fictício): campos lidos, conferência, gravar no imóvel, cadastrar imóvel novo, PDF de imagem.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const O = __dirname + '/planilhas-prints'; fs.mkdirSync(O, { recursive: true });
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
  const ir = async (h) => { await J((x) => { location.hash = x; }, h); await p.waitForTimeout(500); };
  const dlg = 'dialog.janela[open]';
  const botaoDlg = (t) => p.click(`${dlg} footer button:has-text("${t}")`);
  await p.goto('http://localhost:8765/');
  await p.fill('#usuario', 'patrimonio'); await p.fill('#senha', '123456'); await p.click('button[type=submit]');
  await p.waitForFunction(() => window.VP_PRONTO === true, null, { timeout: 90000 });
  // 1) regras de leitura sobre o texto do PDF
  const pdf = fs.readFileSync('/tmp/matricula-ficticia.pdf').toString('base64');
  const r = await J(async (b64) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); return VP.matricula.ler(new File([bin], 'matricula.pdf', { type: 'application/pdf' })); }, pdf);
  console.log('   lido:', JSON.stringify(r.campos));
  const c = r.campos;
  ok(!r.imagem && c.matricula === '12.345' && /Registro de Im[óo]veis/i.test(c.cartorio || ''), 'matrícula e cartório lidos do PDF');
  ok(c.areaTerreno === 1250.5 && c.areaConstruida === 380, 'áreas do terreno e construída');
  ok(c.inscricaoIptu === '01.02.003.0456' && c.logradouro === 'Rua Exemplo das Flores, nº 120' && c.bairro === 'Jardim Modelo', 'inscrição, endereço e bairro');
  ok(c.proprietario === 'Município de Cidade Exemplo' && c.ultimoRegistro === '2019-04-03', 'proprietário atual (último adquirente) e data do último registro');
  const img = fs.readFileSync('/tmp/matricula-imagem.pdf').toString('base64');
  const ri = await J(async (b64) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); return VP.matricula.ler(new File([bin], 'escaneada.pdf', { type: 'application/pdf' })); }, img);
  ok(ri.imagem === true, 'PDF escaneado (sem texto) é reconhecido como imagem');
  // 2) na ficha do imóvel: conferir e gravar
  const id = await J(() => VP.imoveis.lista().find((b) => b.tipo === 'imovel').id);
  await ir('bem/' + id);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-ler-matricula]')]);
  await fc.setFiles('/tmp/matricula-ficticia.pdf'); await p.waitForSelector('#tab-matricula');
  await p.screenshot({ path: O + '/matricula-conferir.png' });
  await p.uncheck(`${dlg} [data-mat-usar="proprietario"]`);
  await p.fill(`${dlg} [data-mat-valor="bairro"]`, 'Jardim Modelo (corrigido)');
  await botaoDlg('Gravar'); await p.waitForTimeout(800);
  const g = await J((id) => { const b = VP.db.pega('bens', id); return { m: b.imovel.matricula, a: b.imovel.areaTerreno, bai: b.endereco?.bairro, pr: b.imovel.proprietarioMatricula, anexo: (b.anexos || []).some((a) => a.tipoAnexo === 'Matrícula'), ev: VP.eventosDoBem(id).some((e) => /matrícula/.test(e.descricao) && e.dados.mudancas?.length >= 5) }; }, id);
  ok(g.m === '12.345' && g.a === 1250.5 && g.bai === 'Jardim Modelo (corrigido)' && !g.pr, 'grava só o que foi marcado, com a correção feita na conferência');
  ok(g.anexo && g.ev, 'PDF anexado como "Matrícula" e antes/depois no histórico');
  // 3) PDF escaneado na ficha: avisa
  const [fc2] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-ler-matricula]')]);
  await fc2.setFiles('/tmp/matricula-imagem.pdf'); await p.waitForSelector(`${dlg} .aviso-inline`);
  ok((await p.textContent(`${dlg} .aviso-inline`)).includes('escaneada'), 'matrícula escaneada: aviso para digitar os dados');
  await botaoDlg('Cancelar'); await p.waitForTimeout(300);
  // 4) novo imóvel pela matrícula
  await ir('novo-bem/imovel');
  const [fc3] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-nova-matricula]')]);
  await fc3.setFiles('/tmp/matricula-ficticia.pdf'); await p.waitForSelector(`${dlg} [data-mat-classe]`);
  await botaoDlg('Incluir imóvel'); await p.waitForTimeout(300);
  ok(/Preencha/.test(await p.textContent(`${dlg} .erro-form`)), 'novo imóvel: pede classificação, unidade e valor');
  const cl = await J(() => VP.db.lista('classificacoes').find((c) => VP.dadosDaClassificacao(c.id).tipoBem === 'imovel' && c.nivel !== 'grupo').id);
  await p.selectOption(`${dlg} [data-mat-classe]`, cl); await p.selectOption(`${dlg} [data-mat-unidade]`, { index: 1 }); await p.fill(`${dlg} [data-mat-valor-aq]`, '350000,00');
  await botaoDlg('Incluir imóvel'); await p.waitForTimeout(900);
  const n = await J(() => { const b = VP.db.lista('bens').find((x) => x.imovel?.matricula === '12.345' && /Imóvel matrícula/.test(x.descricao)); return b && { t: b.tipo, d: b.dataAquisicao, ins: b.imovel.inscricaoIptu, pr: b.imovel.proprietarioMatricula, anx: b.anexos.length, h: location.hash === '#bem/' + b.id }; });
  ok(n && n.t === 'imovel' && n.d === '2019-04-03' && n.ins === '01.02.003.0456' && n.pr === 'Município de Cidade Exemplo' && n.anx === 1 && n.h, 'imóvel novo cadastrado com os dados da matrícula e o PDF anexado: ' + JSON.stringify(n));
  await p.screenshot({ path: O + '/matricula-ficha.png' });
  ok(erros.length === 0, 'sem erros no navegador: ' + JSON.stringify(erros.slice(0, 3)));
  console.log(falhas ? `${falhas} FALHARAM` : 'TUDO PASSOU');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
