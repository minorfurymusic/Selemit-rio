/* VitalPat Patrimônio · Gestão — importar NOMES de unidades / centros de custo (código + nome).
   Usado junto com Exportar e importar → Importar. Lê SÓ as colunas ligadas a "Código" e "Nome":
   as outras colunas do arquivo (por exemplo, nome e matrícula de servidores) não são lidas nem guardadas.
   O arquivo pode repetir o mesmo centro em várias linhas: a prévia junta por código.
   Renomear guarda o nome anterior no histórico da unidade; desfazer volta o nome e manda as unidades novas para a Lixeira. */
'use strict';
(function () {
  const VP = window.VP;
  const u = VP.u;
  const U = VP.importaUnidades = {};
  U.NOME = 'Unidades / centros de custo';
  U.CAMPOS = [
    { k: 'codigo', t: 'Código do centro de custo', tipo: 'texto', apelidos: ['classificacao', 'codigo', 'codigo do centro de custo', 'codigo da unidade', 'centro de custo classificacao'] },
    { k: 'nome', t: 'Nome do centro de custo', tipo: 'texto', apelidos: ['descricao', 'nome', 'nome do centro', 'nome do centro de custo', 'nome da unidade', 'unidade', 'centro de custo descricao'] }
  ];
  const provisorio = (x) => /^Centro de custo /.test(x.nome || '');
  const limpo = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

  // Prévia de uma aba já com as colunas ligadas (a.mapa). Uma linha da prévia por código.
  U.previa = (a) => {
    const iCod = a.mapa.indexOf('codigo'), iNome = a.mapa.indexOf('nome');
    const porCodigo = new Map();
    const itens = [];
    a.linhas.forEach((lin, i) => {
      const nLinha = i + 2 + (a.titulos || 0);
      const codigo = iCod >= 0 ? limpo(lin[iCod]) : '';
      const nome = iNome >= 0 ? limpo(lin[iNome]) : '';
      if (!codigo && !nome) return;
      if (!codigo || !nome) { itens.push({ aba: a.nome, cj: 'unidades', linha: nLinha, valores: { codigo, nome }, descricao: nome, plaqueta: codigo, erros: [!codigo ? 'Linha sem código' : 'Linha sem nome'], avisos: [], mudancas: [], classe: 'erro' }); return; }
      const g = porCodigo.get(codigo) || { codigo, nomes: new Map(), linha: nLinha, repet: 0 };
      g.nomes.set(nome, (g.nomes.get(nome) || 0) + 1); g.repet++;
      porCodigo.set(codigo, g);
    });
    const existentes = new Map(VP.db.lista('unidades', true).map((x) => [String(x.codigo).trim(), x]));
    for (const g of porCodigo.values()) {
      const nomes = [...g.nomes.keys()];
      const it = { aba: a.nome, cj: 'unidades', linha: g.linha, valores: { codigo: g.codigo, nome: nomes[0] }, descricao: nomes[0], plaqueta: g.codigo, erros: [], avisos: [], mudancas: [] };
      if (g.repet > 1) it.avisos.push(`Aparece em ${g.repet} linhas do arquivo (juntadas numa só)`);
      const ex = existentes.get(g.codigo);
      if (nomes.length > 1) it.erros.push(`Conflito: o mesmo código com nomes diferentes no arquivo (${nomes.join(' / ')})`);
      else if (ex && ex.excluido) it.erros.push('Esta unidade está na Lixeira; restaure-a antes');
      else if (ex) {
        it.unidadeId = ex.id;
        if (limpo(ex.nome) !== nomes[0]) {
          it.mudancas.push({ k: 'nome', t: 'Nome', antes: ex.nome, depois: nomes[0] });
          if (provisorio(ex)) it.avisos.push('Troca o nome provisório (criado pela importação de bens) pelo nome real');
        }
      }
      it.classe = it.erros.length ? 'erro' : !ex ? 'novo' : it.mudancas.length ? 'alterado' : 'igual';
      it.marcado = it.classe === 'novo' || it.classe === 'alterado';
      itens.push(it);
    }
    return itens.sort((x, y) => x.plaqueta.localeCompare(y.plaqueta, 'pt-BR', { numeric: true }));
  };

  // Aplica o que está marcado. Nada é apagado: o nome anterior vai para o histórico da unidade.
  U.aplicar = (itens, reg, extra, sucesso, falhas) => {
    reg.unidadesNovasCC = reg.unidadesNovasCC || []; reg.unidadesRenomeadas = reg.unidadesRenomeadas || [];
    extra.unidades = extra.unidades || [];
    const hoje = VP.Plataforma.hoje();
    for (const it of itens) {
      try {
        if (it.classe === 'novo') {
          const x = { id: u.id(), codigo: it.valores.codigo, nome: it.valores.nome, tipo: '', cidade: '', bairro: '', logradouro: '', responsavelId: '', criadaPorImportacao: true, historicoNomes: [] };
          extra.unidades.push(x); reg.unidadesNovasCC.push(x.id);
          sucesso.push(`Unidade nova: ${x.codigo} · ${x.nome}`);
        } else if (it.classe === 'alterado') {
          const x = VP.db.pega('unidades', it.unidadeId);
          const antes = x.nome;
          x.historicoNomes = (x.historicoNomes || []).concat([{ nome: antes, ate: hoje, motivo: `Importação de nomes (${reg.arquivo || ''})` }]);
          x.nome = it.valores.nome;
          extra.unidades.push(x); reg.unidadesRenomeadas.push({ id: x.id, antes });
          sucesso.push(`Renomeada: ${x.codigo} · ${antes} → ${x.nome}`);
        }
      } catch (e) { falhas.push({ item: `${it.aba}, linha ${it.linha}`, motivo: e.message }); }
    }
  };

  U.desfazer = (reg, grava, sucesso, falhas) => {
    const lista = [];
    for (const id of reg.unidadesNovasCC || []) {
      const x = VP.db.pega('unidades', id); if (!x) continue;
      if (VP.db.lista('bens').some((b) => b.unidadeId === id)) { falhas.push({ item: `${x.codigo} · ${x.nome}`, motivo: 'Já tem bens: a unidade continua (mova os bens antes, se quiser tirá-la)' }); continue; }
      x.excluido = true; x.excluidoEm = VP.Plataforma.agoraISO(); lista.push(x); sucesso.push(`Para a Lixeira: ${x.codigo} · ${x.nome}`);
    }
    for (const r of reg.unidadesRenomeadas || []) {
      const x = VP.db.pega('unidades', r.id); if (!x) continue;
      x.historicoNomes = (x.historicoNomes || []).concat([{ nome: x.nome, ate: VP.Plataforma.hoje(), motivo: 'Importação de nomes desfeita' }]);
      x.nome = r.antes; lista.push(x); sucesso.push(`Nome restaurado: ${x.codigo} · ${x.nome}`);
    }
    if (lista.length) grava.unidades = (grava.unidades || []).concat(lista);
  };
})();
