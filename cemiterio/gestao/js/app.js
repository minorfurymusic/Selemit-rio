/* VitalPat Cemitério · Gestão — navegação, menu e início. */
'use strict';
(function () {
  const VP = window.VP;
  const esc = VP.u.esc;

  const MENU = [
    ['painel', 'Painel', '◧'], ['mapa', 'Mapa', '▦'], ['tumulos', 'Túmulos', '☰'], ['importar', 'Importar planilha', '⇩'],
    ['levantamento', 'Localização', '⌖'], ['relatorios', 'Relatórios', '▤'], ['cadastros', 'Cadastros', '☷'],
    ['configuracoes', 'Configurações', '⚙'], ['lixeira', 'Lixeira', '🗑']
  ];
  const rotaMenu = { tumulo: 'tumulos', relatorio: 'relatorios' };

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
      document.title = `${t.titulo} · VitalPat Cemitério`;
      const ativo = rotaMenu[r.tela] || r.tela;
      document.querySelectorAll('#menu a').forEach((a) => a.classList.toggle('ativo', a.dataset.rota === ativo));
      const n = VP.pendencias().length;
      const selo = document.getElementById('selo-pendencias');
      selo.textContent = n; selo.hidden = !n;
      document.body.classList.remove('menu-aberto');
      window.scrollTo(0, 0);
      if (t.ligar) t.ligar();
    }
  };

  const montarLayout = () => {
    document.getElementById('menu').innerHTML = MENU.map(([rota, nome, ic]) => `<a href="#${rota}" data-rota="${rota}"><span class="ic" aria-hidden="true">${ic}</span><span>${nome}</span>${rota === 'painel' ? '<b id="selo-pendencias" class="selo-menu" hidden></b>' : ''}</a>`).join('');
    document.getElementById('busca-global').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const t = e.target.value.trim();
      if (!t) return;
      e.target.value = '';
      VP.app.ir('#tumulos?busca=' + encodeURIComponent(t));
    });
    document.getElementById('abrir-menu').addEventListener('click', () => document.body.classList.toggle('menu-aberto'));
    document.getElementById('sair').addEventListener('click', () => {
      try { localStorage.removeItem('vitalpat-sessao'); } catch (_) { /* nada a fazer */ }
      location.replace('../../index.html?motivo=saiu');
    });
    window.addEventListener('hashchange', () => VP.app.render());
  };

  const iniciar = async () => {
    const carregando = document.getElementById('carregando');
    try {
      const n = await VP.db.carregar();
      if (!n || !VP.db.pega('meta', 'semente')) {
        carregando.querySelector('span').textContent = 'Preparando os dados de exemplo (fictícios)…';
        await VP.db.limparTudo();
        await VP.criarDadosExemplo();
      }
    } catch (e) {
      carregando.innerHTML = `<p>Não foi possível abrir os dados neste navegador. Saia do modo anônimo e tente de novo.<br><small>${esc(e.message || e)}</small></p>`;
      return;
    }
    carregando.remove();
    montarLayout();
    await VP.app.render();
    window.VP_PRONTO = true;
  };

  VP.sessao = (() => { try { return JSON.parse(localStorage.getItem('vitalpat-sessao')); } catch (_) { return null; } })();
  if (!window.VP_SEM_ACESSO) iniciar();
})();
