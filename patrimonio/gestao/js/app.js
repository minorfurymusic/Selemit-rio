/* VitalPat Patrimônio · Gestão — navegação, menu e início. */
'use strict';
(function () {
  const VP = window.VP;
  const esc = VP.u.esc;

  const MENU = [
    ['painel', 'Painel', '◧'], ['bens/moveis', 'Bens móveis', '▦'], ['bens/imoveis', 'Bens imóveis', '⌂'], ['frota', 'Frota', '⛟'], ['controle', 'Itens de controle', '◫'], ['entradas', 'Entradas', '⇩'], ['transferencias', 'Transferências', '⇄'],
    ['inventario', 'Inventário', '☑'], ['manutencao', 'Manutenção', '⚒'], ['financeiro/fechamento', 'Financeiro', '＄'], ['relatorios', 'Relatórios', '▤'],
    ['historico', 'Histórico', '◷'], ['cadastros/unidades', 'Cadastros', '☰'], ['configuracoes', 'Configurações', '⚙'], ['planilhas', 'Exportar e importar', '⇅'], ['lixeira', 'Lixeira', '🗑']
  ];
  const rotaMenu = { relatorio: 'relatorios', unidade: 'cadastros/unidades', imoveis: 'bens/imoveis' };
  // Qual aba do menu acende: a ficha do bem e o "novo bem" acendem a aba do tipo do bem
  const abaDoTipo = (tipo) => (tipo === 'veiculo' ? 'frota' : ['imovel', 'infraestrutura'].includes(tipo) ? 'bens/imoveis' : 'bens/moveis');

  const lerRota = () => {
    const h = location.hash.replace(/^#/, '') || 'painel';
    const [caminho, qs] = h.split('?');
    const [tela, ...resto] = caminho.split('/');
    return { tela, param: resto.join('/') || undefined, query: Object.fromEntries(new URLSearchParams(qs || '')), caminho };
  };

  VP.app = {
    ir(hash) { if (location.hash === hash) this.render(); else location.hash = hash; },
    async render() {
      const r = lerRota();
      const fn = VP.telas[r.tela] || VP.telas.painel;
      let t;
      try { t = fn(r.param, r.query); }
      catch (e) { console.error(e); t = { titulo: 'Algo deu errado', html: `<p class="aviso-inline">Não foi possível abrir esta tela. Detalhe técnico para o suporte: ${esc(e.message)}</p>` }; }
      document.getElementById('titulo-tela').textContent = t.titulo;
      document.getElementById('acoes-tela').innerHTML = t.acoes || '';
      document.getElementById('conteudo').innerHTML = t.html;
      document.title = `${t.titulo} · VitalPat Patrimônio`;
      let ativo = rotaMenu[r.tela] || r.caminho;
      if (r.tela === 'bem') ativo = abaDoTipo(VP.db.pega('bens', r.param)?.tipo);
      if (r.tela === 'novo-bem') ativo = abaDoTipo(r.param);
      if (r.tela === 'bens' && !r.param) ativo = 'bens/moveis';
      const exato = [...document.querySelectorAll('#menu a')].some((a) => a.dataset.rota === ativo);
      document.querySelectorAll('#menu a').forEach((a) => a.classList.toggle('ativo', exato ? a.dataset.rota === ativo : a.dataset.rota.split('/')[0] === ativo.split('/')[0]));
      const n = VP.pendencias().length;
      const selo = document.getElementById('selo-pendencias');
      selo.textContent = n; selo.hidden = !n;
      document.body.classList.remove('menu-aberto');
      window.scrollTo(0, 0);
      if (t.ligar) t.ligar();
    }
  };

  const montarLayout = () => {
    const sv = VP.servidor;
    if (sv.ativo && sv.perfil?.papel === 'admin') MENU.splice(MENU.length - 1, 0, ['pessoas', 'Pessoas', '☺']);
    // Faixa que diz se é demonstração ou o sistema de verdade
    const faixa = document.querySelector('.rodape-demo');
    if (sv.ativo) faixa.textContent = `Conectado ao servidor${sv.municipio ? ' · ' + sv.municipio : ''} · ${sv.perfil.nome || sv.perfil.email}`;
    document.getElementById('modo-sistema').textContent = sv.ativo ? (sv.municipio || 'Conectado') : 'Demonstração';
    document.getElementById('menu').innerHTML = MENU.map(([rota, nome, ic]) => `<a href="#${rota}" data-rota="${rota}"><span class="ic" aria-hidden="true">${ic}</span><span>${nome}</span>${rota === 'painel' ? '<b id="selo-pendencias" class="selo-menu" hidden></b>' : ''}</a>`).join('');
    document.getElementById('busca-global').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const t = e.target.value.trim();
      if (!t) return;
      VP.estado.filtrosBens = { busca: t };
      e.target.value = '';
      VP.app.ir('#bens');
    });
    // Tema: automático → claro → escuro (guardado neste navegador)
    const NOMES_TEMA = { auto: 'automático', claro: 'claro', escuro: 'escuro' };
    const lerTema = () => { try { return localStorage.getItem('vitalpat-tema') || 'auto'; } catch (_) { return 'auto'; } };
    const aplicarTema = (t) => {
      if (t === 'claro') document.documentElement.dataset.theme = 'light';
      else if (t === 'escuro') document.documentElement.dataset.theme = 'dark';
      else delete document.documentElement.dataset.theme;
      document.getElementById('tema').textContent = 'Tema: ' + NOMES_TEMA[t];
    };
    aplicarTema(lerTema());
    document.getElementById('tema').addEventListener('click', () => {
      const prox = { auto: 'claro', claro: 'escuro', escuro: 'auto' }[lerTema()];
      try { localStorage.setItem('vitalpat-tema', prox); } catch (_) { /* vale só nesta visita */ }
      aplicarTema(prox);
    });
    document.getElementById('abrir-menu').addEventListener('click', () => document.body.classList.toggle('menu-aberto'));
    document.getElementById('sair').addEventListener('click', async () => {
      if (VP.servidor.ativo) await VP.servidor.sair();
      try { localStorage.removeItem('vitalpat-sessao'); } catch (_) { /* nada a fazer */ }
      location.replace('../../index.html?motivo=saiu');
    });
    window.addEventListener('hashchange', () => VP.app.render());
    // Listas simples ganham "Baixar planilha" (também quando uma parte da tela é redesenhada)
    let pendente = false;
    new MutationObserver(() => { if (pendente) return; pendente = true; requestAnimationFrame(() => { pendente = false; VP.ui.planilhaNasTabelasSimples(document.getElementById('conteudo')); }); }).observe(document.getElementById('conteudo'), { childList: true, subtree: true });
  };

  const iniciar = async () => {
    const carregando = document.getElementById('carregando');
    try {
      const n = await VP.db.carregar();
      // Dados de exemplo só na demonstração; com servidor, o sistema começa vazio
      if (!VP.servidor.ativo && (!n || !VP.db.pega('meta', 'semente'))) {
        carregando.querySelector('span').textContent = 'Preparando os dados de exemplo (fictícios)…';
        await VP.db.limparTudo();
        await VP.criarDadosExemplo();
      }
    } catch (e) {
      carregando.innerHTML = VP.servidor.ativo
        ? `<p>Não foi possível abrir os dados do servidor. Confira a internet e tente de novo.<br><small>${esc(e.message || e)}</small></p><p><a href="../../index.html?motivo=saiu">Voltar ao login</a></p>`
        : `<p>Não foi possível abrir os dados neste navegador. Saia do modo anônimo e tente de novo.<br><small>${esc(e.message || e)}</small></p>`;
      return;
    }
    if (VP.config().minhaResponsabilidadePadrao && !Object.keys(VP.estado.filtrosBens).length) VP.estado.filtrosBens.minha = true;
    carregando.remove();
    montarLayout();
    if (VP.config().depreciacaoAutomatica === 'abrir' && VP.mesesPendentes(VP.Plataforma.hoje().slice(0, 7)).length) {
      const feitos = await VP.fecharMesesPendentes(VP.Plataforma.hoje().slice(0, 7));
      VP.ui.aviso(`Depreciação lançada automaticamente: ${feitos.map((x) => VP.u.mesExtenso(x.mes)).join(', ')}.`);
    }
    // Manutenção preventiva: abre os chamados que chegaram na antecedência (tarefa, não decisão)
    if (VP.manutencao && (!VP.servidor.ativo || VP.servidor.podeAlterar())) {
      try { const n = await VP.manutencao.gerarPreventivas(); if (n.length) VP.ui.aviso(`${n.length} chamado(s) de manutenção preventiva aberto(s).`); } catch (_) { /* tenta de novo na próxima abertura */ }
    }
    await VP.app.render();
    window.VP_PRONTO = true;
  };

  VP.sessao = (() => { try { return JSON.parse(localStorage.getItem('vitalpat-sessao')); } catch (_) { return null; } })();
  if (!window.VP_SEM_ACESSO) iniciar();
})();
