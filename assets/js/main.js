/* ============================================================================================
   Lira Gomes Psicologia · Neuropsicologia — main.js
   Controle acessível do cabeçalho, sincronização da entrada da hero com o vídeo e escolha de
   contato pelo WhatsApp entre os dois profissionais.
   ============================================================================================ */

(function () {
  'use strict';

  /* ── 1. Configuração explícita de rotas e contatos (fácil de ajustar quando novas páginas entrarem) ── */
  const CONFIG_LIRA_GOMES = {
    rotas: {
      inicio: '#inicio',
      psicoterapia: '#psicoterapia',
      avaliacaoNeuropsicologica: '#avaliacao-neuropsicologica',
      profissionais: '#profissionais',
      contato: '#contato'
    },
    contatosWhatsapp: {
      lucas: {
        nome: 'Lucas Roberto Pereira Gomes',
        crp: 'CRP 06/205736',
        telefoneExibicao: '(11) 98467-7810',
        url: 'https://wa.me/5511984677810'
      },
      thais: {
        nome: 'Thais Lira Silva Gomes',
        crp: 'CRP 06/180230',
        telefoneExibicao: '(11) 95067-3415',
        url: 'https://wa.me/5511950673415'
      }
    }
  };

  window.CONFIG_LIRA_GOMES = CONFIG_LIRA_GOMES;

  const raiz = document.documentElement;
  const corpo = document.body;
  const consultaMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  let movimentoReduzido = consultaMovimentoReduzido.matches;

  /* ── 2. Sincronização da animação do texto da hero com o vídeo ──────────────────────────── */

  const videoHero = document.getElementById('hero-video');
  let heroLiberada = false;

  function liberarEntradaHero() {
    if (heroLiberada) return;
    heroLiberada = true;
    raiz.classList.add('hero-pronta');
  }

  function configurarVideoEAnimacaoHero() {
    if (movimentoReduzido) {
      liberarEntradaHero();
      if (videoHero) {
        videoHero.pause();
        // Posiciona no quadro em que Thais e Lucas já estão visíveis e estáveis (4.5s)
        const posicionarQuadroEstavel = () => {
          try {
            if (videoHero.duration > 4.5) {
              videoHero.currentTime = 4.5;
            }
          } catch (_) {
            /* Ignora se o stream ainda não permitir seek */
          }
        };
        if (videoHero.readyState >= 1) {
          posicionarQuadroEstavel();
        } else {
          videoHero.addEventListener('loadedmetadata', posicionarQuadroEstavel, { once: true });
        }
      }
      return;
    }

    if (!videoHero) {
      liberarEntradaHero();
      return;
    }

    // Dispara a entrada do bloco textual da esquerda para a direita assim que o vídeo inicia
    videoHero.addEventListener('playing', liberarEntradaHero, { once: true });
    videoHero.addEventListener('timeupdate', function aoAtualizarTempo() {
      if (videoHero.currentTime > 0.02) {
        liberarEntradaHero();
        videoHero.removeEventListener('timeupdate', aoAtualizarTempo);
      }
    });

    // Fallback curto (220ms) para nunca atrasar a leitura do H1 ou dos botões caso a rede demore
    setTimeout(liberarEntradaHero, 220);

    // Garante tentativa de reprodução silenciosa conforme políticas dos navegadores
    videoHero.muted = true;
    const promessaPlay = videoHero.play();
    if (promessaPlay && typeof promessaPlay.catch === 'function') {
      promessaPlay.catch(() => {
        liberarEntradaHero();
      });
    }
  }

  configurarVideoEAnimacaoHero();

  consultaMovimentoReduzido.addEventListener('change', (evento) => {
    movimentoReduzido = evento.matches;
    if (movimentoReduzido) {
      liberarEntradaHero();
      if (videoHero) videoHero.pause();
    }
  });

  /* ── 3. Cabeçalho e Menu Mobile Acessível ───────────────────────────────────────────────── */

  const topo = document.querySelector('[data-topo]');
  const botaoMenu = document.querySelector('.menu-botao');
  const menuMovel = document.getElementById('menu-movel');

  function alternarMenu(forcarEstado) {
    if (!botaoMenu || !menuMovel) return;
    const aberto = typeof forcarEstado === 'boolean'
      ? forcarEstado
      : !corpo.classList.contains('menu-aberto');

    corpo.classList.toggle('menu-aberto', aberto);
     corpo.classList.toggle('travado', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute(
      'aria-label',
      aberto ? 'Fechar o menu de navegação' : 'Abrir o menu de navegação'
    );
    menuMovel.setAttribute('aria-hidden', String(!aberto));
  }

  if (botaoMenu && menuMovel) {
    botaoMenu.addEventListener('click', () => alternarMenu());

    menuMovel.querySelectorAll('a, button').forEach((elemento) => {
      elemento.addEventListener('click', () => alternarMenu(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && corpo.classList.contains('menu-aberto')) {
        alternarMenu(false);
      }
    }, { passive: true });
  }

  function atualizarEstadoRolagem() {
    if (!topo) return;
    topo.classList.toggle('rolou', window.scrollY > 16);
  }

  window.addEventListener('scroll', atualizarEstadoRolagem, { passive: true });
  atualizarEstadoRolagem();

  /* ── 4. Escolha Clara de Profissional para Contato pelo WhatsApp ────────────────────────── */

  const modalWhatsapp = document.getElementById('escolha-whatsapp');
  const botoesAbrirWhatsapp = document.querySelectorAll('[data-abrir-whatsapp]');
  const botaoFecharWhatsapp = document.querySelector('[data-fechar-whatsapp]');
  let ultimoElementoFocado = null;

  function abrirEscolhaWhatsapp(evento) {
    if (!modalWhatsapp) return;
    if (evento) evento.preventDefault();
    ultimoElementoFocado = document.activeElement;

    if (corpo.classList.contains('menu-aberto')) {
      alternarMenu(false);
    }

    if (typeof modalWhatsapp.showModal === 'function') {
      if (!modalWhatsapp.open) modalWhatsapp.showModal();
    } else {
      modalWhatsapp.setAttribute('open', '');
    }

    const primeiroLink = modalWhatsapp.querySelector('.opcao-profissional');
    if (primeiroLink) primeiroLink.focus();
  }

  function fecharEscolhaWhatsapp() {
    if (!modalWhatsapp) return;
    if (typeof modalWhatsapp.close === 'function' && modalWhatsapp.open) {
      modalWhatsapp.close();
    } else {
      modalWhatsapp.removeAttribute('open');
    }
    if (ultimoElementoFocado && typeof ultimoElementoFocado.focus === 'function') {
      ultimoElementoFocado.focus();
    }
  }

  botoesAbrirWhatsapp.forEach((botao) => {
    botao.addEventListener('click', abrirEscolhaWhatsapp);
  });

  if (botaoFecharWhatsapp) {
    botaoFecharWhatsapp.addEventListener('click', fecharEscolhaWhatsapp);
  }

  if (modalWhatsapp) {
    modalWhatsapp.addEventListener('click', (evento) => {
      if (evento.target === modalWhatsapp) {
        fecharEscolhaWhatsapp();
      }
    });
  }

  window.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      if (modalWhatsapp && modalWhatsapp.hasAttribute('open')) {
        fecharEscolhaWhatsapp();
        return;
      }
      if (corpo.classList.contains('menu-aberto')) {
        alternarMenu(false);
        if (botaoMenu) botaoMenu.focus();
      }
    }
  });
})();

