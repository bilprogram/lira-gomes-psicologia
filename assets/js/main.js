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
      inicio: 'index.html#inicio',
      psicoterapia: 'index.html#psicoterapia',
      avaliacaoNeuropsicologica: 'index.html#avaliacao-neuropsicologica',
      profissionais: 'index.html#profissionais',
      lucas: 'lucas.html',
      thais: 'thais.html',
      contato: 'index.html#contato'
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

  /* Links dos cards de serviços: destinos vêm de CONFIG_LIRA_GOMES.rotas (ajuste lá quando as páginas existirem) */
  document.querySelectorAll('[data-rota]').forEach((link) => {
    const destino = CONFIG_LIRA_GOMES.rotas[link.dataset.rota];
    if (destino) link.setAttribute('href', destino);
  });

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
      raiz.classList.remove('revelar-ativo');
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

  /* ── 5. Perguntas Frequentes (Acordeão Acessível) ────────────────────────────────────────── */

  const perguntasFaq = document.querySelectorAll('[data-perguntas] details');

  function atualizarAriaExpanded(det) {
    const gatilho = det.querySelector('summary');
    if (gatilho) {
      gatilho.setAttribute('aria-expanded', String(det.open));
    }
  }

  function fecharPergunta(det) {
    const resposta = det.querySelector('.pergunta__resposta');
    if (movimentoReduzido || !resposta || typeof resposta.animate !== 'function') {
      det.open = false;
      atualizarAriaExpanded(det);
      return;
    }
    det.dataset.animando = '1';
    const anim = resposta.animate(
      [
        { height: `${resposta.scrollHeight}px`, opacity: 1 },
        { height: '0px', opacity: 0 }
      ],
      { duration: 380, easing: 'cubic-bezier(.65, 0, .35, 1)' }
    );
    anim.onfinish = anim.oncancel = () => {
      det.open = false;
      atualizarAriaExpanded(det);
      delete det.dataset.animando;
    };
  }

  function abrirPergunta(det) {
    perguntasFaq.forEach((outra) => {
      if (outra !== det && outra.open) {
        fecharPergunta(outra);
      }
    });

    det.open = true;
    atualizarAriaExpanded(det);

    const resposta = det.querySelector('.pergunta__resposta');
    if (movimentoReduzido || !resposta || typeof resposta.animate !== 'function') {
      return;
    }

    det.dataset.animando = '1';
    const altura = resposta.scrollHeight;
    const anim = resposta.animate(
      [
        { height: '0px', opacity: 0 },
        { height: `${altura}px`, opacity: 1 }
      ],
      { duration: 460, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    );
    anim.onfinish = anim.oncancel = () => {
      delete det.dataset.animando;
    };
  }

  perguntasFaq.forEach((det) => {
    atualizarAriaExpanded(det);
    const gatilho = det.querySelector('summary');
    if (!gatilho) return;

    gatilho.addEventListener('click', (evento) => {
      evento.preventDefault();
      if (det.dataset.animando) return;
      if (det.open) {
        fecharPergunta(det);
      } else {
        abrirPergunta(det);
      }
    });
  });

  /* ── 5. Revelação ao Rolar (Scroll Animations & Choreography) ───────────────────────────── */

  const reveladores = document.querySelectorAll('[data-revela]');
  if ('IntersectionObserver' in window && reveladores.length && !movimentoReduzido) {
    document.querySelectorAll('[data-revela-grupo]').forEach((grupo) => {
      grupo.querySelectorAll('[data-revela]').forEach((el, i) => {
        el.style.setProperty('--atraso', `${Math.min(i * 0.08, 0.48)}s`);
      });
    });

    raiz.classList.add('revelar-ativo');

    // A máscara fechada (clip-path: inset) tem área visual inicial zero no Chromium;
    // por isso, observamos o container pai quando for máscara.
    const observados = new Map();
    reveladores.forEach((el) => {
      const observado = el.dataset.revela === 'mascara' && el.parentElement ? el.parentElement : el;
      if (!observados.has(observado)) observados.set(observado, []);
      observados.get(observado).push(el);
    });

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        (observados.get(entrada.target) || []).forEach((el) => el.classList.add('visivel'));
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    observados.forEach((_, observado) => observador.observe(observado));
  }

  /* ── 6. Exercício de Respiração Interativo (Respire Comigo) ─────────────────────────── */

  const orbe = document.querySelector('[data-orbe]');
  if (orbe) {
    const secao = orbe.closest('.respiro');
    const nucleo = orbe.querySelector('.orbe__nucleo');
    const aneis = orbe.querySelectorAll('.orbe__anel');
    const instrucao = orbe.querySelector('[data-orbe-instrucao]');
    const barra = orbe.querySelector('[data-orbe-progresso]');
    const botao = document.querySelector('[data-respiro-iniciar]');
    const rotulo = document.querySelector('[data-respiro-rotulo]');
    const ciclosTexto = document.querySelector('[data-respiro-ciclos]');
    const botoesDeRitmo = document.querySelectorAll('[data-ritmo]');
    const CICLOS = 5;
    const CIRCUNFERENCIA = 603.2;
    const PEQUENO = 0.74;
    const GRANDE = 1.06;
    const textoInicial = ciclosTexto ? ciclosTexto.textContent : '5 ciclos · cerca de 1 minuto';
    let ritmo = [4, 2, 6, 0];
    let rodando = false;
    let ciclo = 0;
    let relogio = 0;
    let animacoes = [];

    const fases = () => [
      { nome: 'Inspire', de: PEQUENO, para: GRANDE, duracao: ritmo[0] },
      { nome: 'Segure', de: GRANDE, para: GRANDE, duracao: ritmo[1] },
      { nome: 'Solte', de: GRANDE, para: PEQUENO, duracao: ritmo[2] },
      { nome: 'Segure', de: PEQUENO, para: PEQUENO, duracao: ritmo[3] }
    ].filter((f) => f.duracao > 0);

    const dizer = (texto) => {
      if (!instrucao) return;
      instrucao.style.opacity = '0';
      setTimeout(() => {
        instrucao.textContent = texto;
        instrucao.style.opacity = '1';
      }, 220);
    };

    const animar = (el, quadros, opcoes) => {
      if (!el || typeof el.animate !== 'function') return;
      animacoes.push(el.animate(quadros, Object.assign({ fill: 'forwards' }, opcoes)));
    };

    function fase(indice) {
      if (!rodando) return;
      const lista = fases();
      if (indice >= lista.length) {
        if (ciclo >= CICLOS) {
          concluir();
          return;
        }
        ciclo += 1;
        indice = 0;
        comecarCiclo();
      }
      const f = lista[indice];
      const ms = f.duracao * 1000;
      dizer(f.nome);
      const curva = 'cubic-bezier(.45, 0, .55, 1)';
      if (movimentoReduzido) {
        animar(
          nucleo,
          [{ opacity: f.de === PEQUENO ? 0.55 : 1 }, { opacity: f.para === PEQUENO ? 0.55 : 1 }],
          { duration: ms, easing: curva }
        );
      } else {
        animar(
          nucleo,
          [{ transform: `scale(${f.de})` }, { transform: `scale(${f.para})` }],
          { duration: ms, easing: curva }
        );
        aneis.forEach((anel, i) => {
          const de = 1 + (f.de - PEQUENO) * (0.16 - i * 0.04);
          const para = 1 + (f.para - PEQUENO) * (0.16 - i * 0.04);
          animar(
            anel,
            [{ transform: `scale(${de})` }, { transform: `scale(${para})` }],
            { duration: ms, easing: curva, delay: i * 90 }
          );
        });
      }
      relogio = setTimeout(() => fase(indice + 1), ms);
    }

    function comecarCiclo() {
      const total = fases().reduce((s, f) => s + f.duracao, 0) * 1000;
      animar(
        barra,
        [{ strokeDashoffset: CIRCUNFERENCIA }, { strokeDashoffset: 0 }],
        { duration: total, easing: 'linear' }
      );
      if (ciclosTexto) ciclosTexto.textContent = `Ciclo ${ciclo} de ${CICLOS}`;
    }

    function limpar() {
      clearTimeout(relogio);
      animacoes.forEach((a) => {
        try {
          a.cancel();
        } catch (_) {
          /* ignora se já finalizou */
        }
      });
      animacoes = [];
    }

    function iniciar() {
      limpar();
      rodando = true;
      ciclo = 1;
      if (secao) secao.classList.add('respirando');
      if (rotulo) rotulo.textContent = 'Parar';
      comecarCiclo();
      fase(0);
    }

    function parar(textoDoFim) {
      limpar();
      rodando = false;
      if (secao) secao.classList.remove('respirando');
      if (rotulo) rotulo.textContent = 'Começar';
      if (ciclosTexto) ciclosTexto.textContent = textoInicial;
      dizer(textoDoFim || 'Respire');
    }

    function concluir() {
      parar('Muito bem');
      if (ciclosTexto) ciclosTexto.textContent = 'Você completou 5 ciclos. Como se sente agora?';
      if (rotulo) rotulo.textContent = 'Respirar de novo';
    }

    if (botao) {
      botao.addEventListener('click', () => (rodando ? parar() : iniciar()));
    }

    botoesDeRitmo.forEach((b) => {
      b.addEventListener('click', () => {
        botoesDeRitmo.forEach((outro) => outro.setAttribute('aria-pressed', String(outro === b)));
        ritmo = b.dataset.ritmo.split(',').map(Number);
        if (rodando) iniciar();
      });
    });
  }
})();

