/* ============================================================================================
   Lira Gomes Psicologia · Neuropsicologia — main.js
   Controle acessível do cabeçalho, sincronização da entrada da hero com o vídeo e escolha de
   contato pelo WhatsApp entre os dois profissionais.
   ============================================================================================ */

(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }

  /* ── 1. Configuração explícita de rotas e contatos (fácil de ajustar quando novas páginas entrarem) ── */
  const CONFIG_LIRA_GOMES = {
    rotas: {
      inicio: 'index.html#inicio',
      psicoterapia: 'psicoterapia.html',
      avaliacaoNeuropsicologica: 'avaliacao-neuropsicologica.html',
      profissionais: 'index.html#profissionais',
      lucas: 'lucas.html',
      thais: 'thais.html',
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

  /* Links dos cards de serviços: destinos vêm de CONFIG_LIRA_GOMES.rotas (ajuste lá quando as páginas existirem) */
  document.querySelectorAll('[data-rota]').forEach((link) => {
    const destino = CONFIG_LIRA_GOMES.rotas[link.dataset.rota];
    if (destino) link.setAttribute('href', destino);
  });

  /* Atualização automática do ano no rodapé */
  const elementoAno = document.querySelector('[data-ano]');
  if (elementoAno) {
    elementoAno.textContent = new Date().getFullYear();
  }

  const raiz = document.documentElement;
  const corpo = document.body;
  const consultaMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  let movimentoReduzido = consultaMovimentoReduzido.matches;

  /* ── 2. Controle de Reprodução e Entrada Editorial da Hero ────────────────────────────── */

  const videoHero = document.getElementById('hero-video');
  const tituloHero = document.getElementById('hero-titulo');
  let heroLiberada = false;
  let heroJaAnimou = false;
  let videoVisivelNaTela = true;

  // Detecção de conexão de dados reduzidos ou rede lenta
  const conexaoRede = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const conexaoEconomica = Boolean(conexaoRede && (conexaoRede.saveData || conexaoRede.effectiveType === 'slow-2g' || conexaoRede.effectiveType === '2g'));

  function prepararTituloHero() {
    if (!tituloHero) return;

    if (!tituloHero.getAttribute('data-texto-original')) {
      tituloHero.setAttribute('data-texto-original', tituloHero.textContent.trim().replace(/\s+/g, ' '));
    }
    const textoCompleto = tituloHero.getAttribute('data-texto-original');
    const palavras = textoCompleto.split(' ');

    // Cria elementos temporários para aferição do quebra-linhas exato do navegador
    tituloHero.innerHTML = palavras
      .map((p) => `<span class="hero__palavra-temp" style="display:inline-block;">${p}&nbsp;</span>`)
      .join('');

    const spans = tituloHero.querySelectorAll('.hero__palavra-temp');
    const linhas = [];
    let linhaAtual = [];
    let topAtual = null;

    spans.forEach((span) => {
      const top = Math.round(span.getBoundingClientRect().top);
      if (topAtual === null || Math.abs(top - topAtual) <= 4) {
        linhaAtual.push(span.textContent.trim());
        topAtual = top;
      } else {
        linhas.push(linhaAtual.join(' '));
        linhaAtual = [span.textContent.trim()];
        topAtual = top;
      }
    });
    if (linhaAtual.length) {
      linhas.push(linhaAtual.join(' '));
    }

    // Calcula atrasos dinâmicos em cascata a partir do número de linhas
    const isMobile = window.innerWidth <= 768;
    const atrasoLinhaBase = isMobile ? 350 : 400;
    const atrasoEntreLinhas = isMobile ? 70 : 110;
    const totalLinhas = Math.max(linhas.length, 1);
    const atrasoSubtitulo = atrasoLinhaBase + (totalLinhas - 1) * atrasoEntreLinhas + 150;
    const atrasoBtn1 = atrasoSubtitulo + 120;
    const atrasoBtn2 = atrasoBtn1 + 120;
    const atrasoLink = atrasoBtn2 + 120;
    const atrasoNota = atrasoLink + 120;

    const blocoHero = tituloHero.closest('.hero__conteudo') || tituloHero.parentElement;
    if (blocoHero) {
      blocoHero.style.setProperty('--atraso-subtitulo', `${atrasoSubtitulo}ms`);
      blocoHero.style.setProperty('--atraso-btn-1', `${atrasoBtn1}ms`);
      blocoHero.style.setProperty('--atraso-btn-2', `${atrasoBtn2}ms`);
      blocoHero.style.setProperty('--atraso-link', `${atrasoLink}ms`);
      blocoHero.style.setProperty('--atraso-nota', `${atrasoNota}ms`);
    }

    // Monta estrutura acessível (sr-only para leitores de tela + linhas com máscara para exibição visual)
    const estiloLinhaJaAnimada = heroJaAnimou ? 'style="transform:none;opacity:1;filter:none;"' : '';
    const htmlLinhas = linhas
      .map((linha, idx) => `
        <span class="hero__linha-mascara">
          <span class="hero__linha" style="--i:${idx};" ${estiloLinhaJaAnimada}>${linha}</span>
        </span>
      `)
      .join('');

    tituloHero.innerHTML = `
      <span class="sr-only">${textoCompleto}</span>
      <span class="hero__titulo-linhas" aria-hidden="true">${htmlLinhas}</span>
    `;
  }

  // Executa cálculo tipográfico após fontes carregadas
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(prepararTituloHero).catch(prepararTituloHero);
  } else {
    prepararTituloHero();
  }

  // Recálculo debounced em resize sem reanimar
  let temporizadorResizeTitulo = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizadorResizeTitulo);
    temporizadorResizeTitulo = setTimeout(() => {
      prepararTituloHero();
      recalcularMedidasHero();
    }, 150);
  }, { passive: true });

  function liberarEntradaHero() {
    if (heroLiberada) return;
    heroLiberada = true;
    raiz.classList.add('hero-pronta');
    setTimeout(() => {
      heroJaAnimou = true;
      raiz.classList.add('hero-animada');
    }, 2200);
  }

  function verificarVisibilidadeVideo() {
    if (!videoHero) return false;
    const hero = videoHero.closest('.hero');
    if (!hero) return false;

    // Em telas onde a hero é sticky, quando os serviços sobem, a hero fica coberta
    const scrollYAtual = Math.max(window.scrollY || window.pageYOffset || 0, 0);
    const alturaHero = hero.offsetHeight || window.innerHeight;
    if (scrollYAtual >= alturaHero) {
      return false;
    }

    const rect = hero.getBoundingClientRect();
    return rect.bottom > 60 && rect.top < window.innerHeight;
  }

  function pausarVideo() {
    if (videoHero && !videoHero.paused) {
      try {
        videoHero.pause();
      } catch (_) {}
    }
  }

  function reproduzirVideo() {
    videoVisivelNaTela = verificarVisibilidadeVideo();
    if (!videoHero || movimentoReduzido || conexaoEconomica || document.hidden || !videoVisivelNaTela) return;
    if (videoHero.paused) {
      videoHero.muted = true;
      const promessaPlay = videoHero.play();
      if (promessaPlay && typeof promessaPlay.catch === 'function') {
        promessaPlay.catch(() => {
          liberarEntradaHero();
        });
      }
    }
  }

  function gerenciarReproducaoVideo() {
    if (!videoHero) return;
    videoVisivelNaTela = verificarVisibilidadeVideo();
    if (movimentoReduzido || conexaoEconomica || document.hidden || !videoVisivelNaTela) {
      pausarVideo();
    } else {
      reproduzirVideo();
    }
  }

  function configurarVideoEAnimacaoHero() {
    if (movimentoReduzido || conexaoEconomica) {
      liberarEntradaHero();
      if (videoHero) {
        pausarVideo();
        // Em movimento reduzido ou economia de dados, exibe o quadro estável ou o poster
        const posicionarQuadroEstavel = () => {
          try {
            if (videoHero.duration > 4.5) {
              videoHero.currentTime = 4.5;
            }
          } catch (_) {}
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

    videoHero.defaultMuted = true;
    videoHero.muted = true;
    videoHero.playsInline = true;

    // Dispara a entrada dos elementos textuais assim que o vídeo inicia
    videoHero.addEventListener('playing', liberarEntradaHero, { once: true });
    videoHero.addEventListener('timeupdate', function aoAtualizarTempo() {
      if (videoHero.currentTime > 0.02) {
        liberarEntradaHero();
        videoHero.removeEventListener('timeupdate', aoAtualizarTempo);
      }
    });

    // Fallback curto (220ms) para nunca atrasar a leitura do H1 ou dos botões caso a rede demore
    setTimeout(liberarEntradaHero, 220);

    videoHero.addEventListener('loadeddata', reproduzirVideo, { once: true });
    videoHero.addEventListener('canplay', reproduzirVideo, { once: true });

    // IntersectionObserver exclusivo para pausar o vídeo fora da viewport e desocupar GPU/decodificador
    if ('IntersectionObserver' in window) {
      const observadorVideo = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          videoVisivelNaTela = entrada.isIntersecting && entrada.intersectionRatio > 0.05;
          gerenciarReproducaoVideo();
        });
      }, { threshold: [0, 0.05, 0.25] });

      observadorVideo.observe(videoHero);
    }

    // Pausa imediata quando a aba estiver em segundo plano (visibilitychange)
    document.addEventListener('visibilitychange', () => {
      gerenciarReproducaoVideo();
    });

    reproduzirVideo();
  }

  configurarVideoEAnimacaoHero();

  consultaMovimentoReduzido.addEventListener('change', (evento) => {
    movimentoReduzido = evento.matches;
    if (movimentoReduzido) {
      liberarEntradaHero();
      pausarVideo();
      raiz.classList.remove('revelar-ativo');
    } else {
      gerenciarReproducaoVideo();
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

    if (aberto) {
      const primeiroItem = menuMovel.querySelector('a, button');
      if (primeiroItem) {
        setTimeout(() => primeiroItem.focus(), 50);
      }
    } else if (document.activeElement && menuMovel.contains(document.activeElement)) {
      botaoMenu.focus();
    }
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

  /* ── Controle de Rolagem do Topo (Vidro Permanente após 40px e Scroll Spy) ────────── */

  const heroElement = document.getElementById('inicio');
  const heroConteudo = document.querySelector('.hero__conteudo');
  let cachedAlturaHero = 900;
  let ultimoProgressoHero = -1;

  function recalcularMedidasHero() {
    if (heroElement) {
      cachedAlturaHero = heroElement.offsetHeight || window.innerHeight;
    }
  }
  recalcularMedidasHero();

  let rolagemPendente = false;
  let estadoRolou = null;
  const SELETORES_SECOES = ['#inicio', '#psicoterapia', '#avaliacao-neuropsicologica', '#profissionais', '#contato'];
  const secoesNav = SELETORES_SECOES.map((sel) => document.querySelector(sel)).filter(Boolean);
  const linksMenu = document.querySelectorAll('.menu a, .menu-movel__lista a');

  function atualizarEstadoRolagem() {
    rolagemPendente = false;
    if (!topo) return;

    const scrollYAtual = Math.max(window.scrollY || window.pageYOffset || 0, 0);

    // Estado após 40px: vidro escuro verde profundo
    const novoRolou = scrollYAtual > 40;
    if (novoRolou !== estadoRolou) {
      estadoRolou = novoRolou;
      topo.classList.toggle('rolou', estadoRolou);
      topo.classList.toggle('scrolled', estadoRolou);
    }

    // Frente 1: Transição progressiva da hero ao subir a segunda dobra (embaçamento e fade)
    if (heroConteudo && !movimentoReduzido) {
      if (scrollYAtual <= cachedAlturaHero * 1.15) {
        const limiteScroll = cachedAlturaHero * 0.70;
        const p = Math.min(Math.max(scrollYAtual / limiteScroll, 0), 1);

        if (Math.abs(p - ultimoProgressoHero) > 0.002) {
          ultimoProgressoHero = p;
          heroConteudo.style.setProperty('--hero-p', p.toFixed(3));

          if (p > 0.005 && p < 0.995) {
            heroConteudo.classList.add('hero-transicao-ativa');
            heroConteudo.classList.remove('hero-oculta');
          } else if (p >= 0.995) {
            heroConteudo.classList.remove('hero-transicao-ativa');
            heroConteudo.classList.add('hero-oculta');
          } else {
            heroConteudo.classList.remove('hero-transicao-ativa', 'hero-oculta');
          }

          // Desativa cliques nos botões quando opacidade estiver abaixo de 0.2 (p > 0.8)
          if (p > 0.80) {
            heroConteudo.setAttribute('data-opaca-baixa', 'true');
          } else {
            heroConteudo.removeAttribute('data-opaca-baixa');
          }
        }
      }
    }

    // Esconde a hero (visibility: hidden) quando totalmente coberta pela segunda dobra
    if (heroElement) {
      if (scrollYAtual >= cachedAlturaHero) {
        if (heroElement.style.visibility !== 'hidden') {
          heroElement.style.visibility = 'hidden';
        }
      } else {
        if (heroElement.style.visibility !== 'visible') {
          heroElement.style.visibility = 'visible';
        }
      }
    }

    // Gerencia pausa do vídeo da hero quando coberto ou fora da tela
    gerenciarReproducaoVideo();

    // Atualização do item ativo conforme a seção visível (Scroll Spy)
    if (secoesNav.length && linksMenu.length) {
      const topoOffset = estadoRolou ? 70 : 96;
      let secaoAtiva = null;

      for (let i = secoesNav.length - 1; i >= 0; i--) {
        const sec = secoesNav[i];
        const rect = sec.getBoundingClientRect();
        if (rect.top <= topoOffset + 40) {
          secaoAtiva = sec.id;
          break;
        }
      }

      if (!secaoAtiva && secoesNav[0]) {
        secaoAtiva = secoesNav[0].id;
      }

      if (secaoAtiva) {
        linksMenu.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const match = href === `#${secaoAtiva}` || href.endsWith(`#${secaoAtiva}`);
          if (match) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('atual');
          } else {
            link.removeAttribute('aria-current');
            link.classList.remove('atual');
          }
        });
      }
    }
  }

  function dispararAtualizacaoScroll() {
    if (!rolagemPendente) {
      rolagemPendente = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(atualizarEstadoRolagem);
      } else {
        setTimeout(atualizarEstadoRolagem, 16);
      }
    }
  }

  window.addEventListener('scroll', dispararAtualizacaoScroll, { passive: true });
  window.addEventListener('load', dispararAtualizacaoScroll, { passive: true });
  window.addEventListener('pageshow', dispararAtualizacaoScroll, { passive: true });
  dispararAtualizacaoScroll();

  /* ── 4. Escolha Clara de Profissional para Contato pelo WhatsApp ────────────────────────── */

  const modalWhatsapp = document.getElementById('escolha-whatsapp');
  const botoesAbrirWhatsapp = document.querySelectorAll('[data-abrir-whatsapp]');
  const botaoFecharWhatsapp = document.querySelector('[data-fechar-whatsapp]');
  let ultimoElementoFocado = null;
  let servicoAtivo = 'psicoterapia';

  const MENSAGENS_WHATSAPP = {
    psicoterapia: 'Olá, vim pelo site e gostaria de saber mais sobre a psicoterapia.',
    avaliacao: 'Olá, vim pelo site e gostaria de saber mais sobre a avaliação neuropsicológica.'
  };

  function atualizarLinksWhatsapp(servico) {
    if (!modalWhatsapp) return;
    servicoAtivo = servico || servicoAtivo || 'psicoterapia';
    const mensagem = MENSAGENS_WHATSAPP[servicoAtivo] || MENSAGENS_WHATSAPP.psicoterapia;
    const encoded = encodeURIComponent(mensagem);

    const linksProfissionais = modalWhatsapp.querySelectorAll('.opcao-profissional');
    linksProfissionais.forEach((link) => {
      const baseUrl = link.href.split('?')[0];
      link.href = `${baseUrl}?text=${encoded}`;
    });

    const abas = modalWhatsapp.querySelectorAll('[data-aba-servico]');
    abas.forEach((aba) => {
      const eAtiva = aba.getAttribute('data-aba-servico') === servicoAtivo;
      aba.setAttribute('aria-pressed', eAtiva ? 'true' : 'false');
    });
  }

  function abrirEscolhaWhatsapp(evento) {
    if (!modalWhatsapp) return;
    if (evento) evento.preventDefault();
    ultimoElementoFocado = document.activeElement;

    const gatilho = evento && evento.currentTarget ? evento.currentTarget : null;
    const servico = gatilho ? gatilho.getAttribute('data-servico') : null;
    atualizarLinksWhatsapp(servico || servicoAtivo);

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

  if (modalWhatsapp) {
    modalWhatsapp.querySelectorAll('[data-aba-servico]').forEach((aba) => {
      aba.addEventListener('click', () => {
        const servico = aba.getAttribute('data-aba-servico');
        atualizarLinksWhatsapp(servico);
      });
    });
  }

  // Inicializa os links do modal já configurados
  atualizarLinksWhatsapp('psicoterapia');

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
    if (!det.open) return;
    if (movimentoReduzido) {
      det.open = false;
      det.classList.remove('faq-aberto');
      atualizarAriaExpanded(det);
      return;
    }
    det.dataset.animando = '1';
    det.classList.remove('faq-aberto');
    atualizarAriaExpanded(det);
    setTimeout(() => {
      det.open = false;
      delete det.dataset.animando;
    }, 400);
  }

  function abrirPergunta(det) {
    perguntasFaq.forEach((outra) => {
      if (outra !== det && outra.open) {
        fecharPergunta(outra);
      }
    });

    det.open = true;
    atualizarAriaExpanded(det);

    if (movimentoReduzido) {
      det.classList.add('faq-aberto');
      return;
    }

    det.dataset.animando = '1';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        det.classList.add('faq-aberto');
      });
    });
    setTimeout(() => {
      delete det.dataset.animando;
    }, 450);
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


  function prepararTitulosSecaoLinhas() {
    if (movimentoReduzido) return;
    const titulos = document.querySelectorAll(
      'h1[data-revela]:not(.hero__titulo), h2[data-revela]:not(.modal-whatsapp__titulo), .titulo-editorial[data-revela], .servicos__titulo[data-revela], .respiro__titulo[data-revela], .local__titulo[data-revela], .duvidas__titulo[data-revela], .servico-hero__nome[data-revela], .perfil-hero__nome[data-revela]'
    );

    titulos.forEach((titulo) => {
      // Salva HTML e texto originais se ainda não salvos
      if (!titulo.dataset.htmlOriginal) {
        titulo.dataset.htmlOriginal = titulo.innerHTML;
        titulo.dataset.textoOriginal = titulo.textContent.trim().replace(/\s+/g, ' ');
      }
      const htmlOriginal = titulo.dataset.htmlOriginal;
      const textoOriginal = titulo.dataset.textoOriginal;
      if (!textoOriginal) return;

      const jaVisivel = titulo.classList.contains('visivel');

      try {
        // Clona temporariamente preservando tags (ex: <em>) e envolvendo palavras em spans
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlOriginal;

        function wrapText(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.nodeValue.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) {
                frag.appendChild(document.createTextNode(p));
              } else {
                const sp = document.createElement('span');
                sp.className = 'revela-palavra-temp';
                sp.style.display = 'inline-block';
                sp.textContent = p;
                frag.appendChild(sp);
              }
            });
            node.parentNode.replaceChild(frag, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(wrapText);
          }
        }
        wrapText(tempDiv);
        titulo.innerHTML = tempDiv.innerHTML;

        const spans = titulo.querySelectorAll('.revela-palavra-temp');
        if (!spans.length) {
          titulo.innerHTML = htmlOriginal;
          return;
        }

        const linhas = [];
        let linhaAtual = [];
        let topAtual = null;

        spans.forEach((span) => {
          const top = Math.round(span.getBoundingClientRect().top);
          if (topAtual === null || Math.abs(top - topAtual) <= 6) {
            linhaAtual.push(span.outerHTML);
            topAtual = top;
          } else {
            if (linhaAtual.length) linhas.push(linhaAtual.join(' '));
            linhaAtual = [span.outerHTML];
            topAtual = top;
          }
        });
        if (linhaAtual.length) linhas.push(linhaAtual.join(' '));

        const isMobile = window.innerWidth <= 768;
        const atrasoEntreLinhas = isMobile ? 80 : 120; // 120ms desktop, 80ms mobile

        const htmlLinhas = linhas
          .map((linhaHtml, idx) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = linhaHtml;
            wrapper.querySelectorAll('.revela-palavra-temp').forEach((sp) => {
              sp.replaceWith(...sp.childNodes);
            });
            return `
            <span class="revela-linha-mascara">
              <span class="revela-linha" aria-hidden="true" style="--atraso-linha:${idx * atrasoEntreLinhas}ms;">${wrapper.innerHTML}</span>
            </span>
          `;
          })
          .join('');

        titulo.innerHTML = `
          <span class="sr-only">${textoOriginal}</span>
          <span class="revela-titulo-linhas" aria-hidden="true">${htmlLinhas}</span>
        `;
        titulo.setAttribute('aria-label', textoOriginal);
        titulo.setAttribute('data-linhas-preparadas', 'true');
        titulo.setAttribute('data-revela-tipo', 'linhas');
        if (jaVisivel) {
          titulo.classList.add('visivel');
          titulo.querySelectorAll('.revela-linha').forEach((linha) => {
            linha.style.opacity = '1';
            linha.style.filter = 'none';
            linha.style.transform = 'none';
            linha.style.willChange = 'auto';
          });
        }
      } catch (err) {
        // Fallback de segurança: nada quebra, texto inteiro visível intacto
        titulo.innerHTML = htmlOriginal;
        titulo.classList.add('visivel');
      }
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      prepararTitulosSecaoLinhas();
    }, 150);
  }, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      prepararTitulosSecaoLinhas();
    });
  }

  function inicializarReveals() {
    if (movimentoReduzido) {
      document.querySelectorAll('[data-revela]').forEach((el) => el.classList.add('visivel'));
      return;
    }

    // Prepara títulos de seção com máscara por linha com proteção em try/catch
    try {
      prepararTitulosSecaoLinhas();
    } catch (e) {
      console.warn('Fallback em títulos:', e);
    }

    const reveladores = document.querySelectorAll('[data-revela]');
    if (!reveladores.length) return;

    // Escalonamento entre irmãos de um mesmo grupo (80 a 120ms até 8 elementos; 40ms acima)
    document.querySelectorAll('[data-revela-grupo]').forEach((grupo) => {
      const filhos = grupo.querySelectorAll(':scope > [data-revela], :scope > * > [data-revela]');
      const total = filhos.length;
      const isMobile = window.innerWidth <= 768;
      const stagger = total > 8 ? 0.040 : (isMobile ? 0.080 : 0.100);
      filhos.forEach((el, i) => {
        el.style.setProperty('--atraso', `${(i * stagger).toFixed(3)}s`);
      });
    });

    // Função centralizada e segura para revelar elementos
    let blurAtivos = 0;
    const MAX_BLUR_SIMULTANEOS = 12;

    function revelarElemento(el, imediato = false) {
      if (!el || el.classList.contains('visivel')) return;
      try {
        el.classList.add('visivel');
        if (imediato) {
          el.classList.remove('animando');
          el.style.setProperty('--atraso', '0s');
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.transform = 'none';
          el.style.willChange = 'auto';
          if (el.dataset.revelaTipo === 'linhas') {
            el.querySelectorAll('.revela-linha').forEach((linha) => {
              linha.style.opacity = '1';
              linha.style.filter = 'none';
              linha.style.transform = 'none';
              linha.style.willChange = 'auto';
            });
          }
          return;
        }

        const limpar = () => {
          el.classList.remove('animando');
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.transform = 'none';
          el.style.willChange = 'auto';
          if (el.dataset.revelaTipo === 'linhas') {
            el.querySelectorAll('.revela-linha').forEach((linha) => {
              linha.style.opacity = '1';
              linha.style.filter = 'none';
              linha.style.transform = 'none';
              linha.style.willChange = 'auto';
            });
          }
          blurAtivos = Math.max(0, blurAtivos - 1);
          el.removeEventListener('transitionend', limpar);
        };

        if (blurAtivos < MAX_BLUR_SIMULTANEOS) {
          blurAtivos++;
          el.classList.add('animando');
          el.addEventListener('transitionend', limpar, { once: true });
          setTimeout(limpar, 1400);
        } else {
          el.classList.add('sem-blur', 'animando');
          el.addEventListener('transitionend', limpar, { once: true });
          setTimeout(limpar, 1400);
        }
      } catch (err) {
        el.classList.add('visivel');
      }
    }

    // REDE DE SEGURANÇA 1: Todo elemento cujo topo já passou da viewport é revelado na hora (cobre topo da página e reload no meio)
    const alturaJanela = window.innerHeight || document.documentElement.clientHeight;
    reveladores.forEach((el) => {
      try {
        const rect = el.getBoundingClientRect();
        if (rect.top <= alturaJanela * 0.90) {
          revelarElemento(el, true);
        }
      } catch (e) {}
    });

    // Mapeamento para IntersectionObserver
    const observados = new Map();
    reveladores.forEach((el) => {
      if (el.classList.contains('visivel')) return;
      const observado = el.dataset.revela === 'mascara' && el.parentElement ? el.parentElement : el;
      if (!observados.has(observado)) {
        observados.set(observado, []);
      }
      observados.get(observado).push(el);
    });

    // IntersectionObserver único compartilhado (threshold 0 e rootMargin inferior de -8% para elementos altos e disparos confiáveis)
    if ('IntersectionObserver' in window) {
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const els = observados.get(entrada.target) || [entrada.target];
          els.forEach((el) => revelarElemento(el, false));
          observador.unobserve(entrada.target);
          observados.delete(entrada.target);
          if (observados.size === 0) {
            observador.disconnect();
          }
        });
      }, {
        threshold: 0,
        rootMargin: '0px 0px -8% 0px'
      });

      observados.forEach((_, observado) => observador.observe(observado));
    } else {
      // Fallback sem IntersectionObserver
      reveladores.forEach((el) => revelarElemento(el, true));
    }

    // REDE DE SEGURANÇA 2: Listener de scroll passivo com requestAnimationFrame para checar qualquer elemento que entre na tela
    let rafScrollId = null;
    function checarElementosNoScroll() {
      if (rafScrollId) return;
      rafScrollId = requestAnimationFrame(() => {
        rafScrollId = null;
        const h = window.innerHeight || document.documentElement.clientHeight;
        document.querySelectorAll('[data-revela]:not(.visivel)').forEach((el) => {
          try {
            const r = el.getBoundingClientRect();
            if (r.top <= h * 0.92) {
              revelarElemento(el, false);
            }
          } catch (e) {}
        });
      });
    }

    window.addEventListener('scroll', checarElementosNoScroll, { passive: true });
    window.addEventListener('resize', checarElementosNoScroll, { passive: true });

    // REDE DE SEGURANÇA 3: Suporte a cliques em âncoras para revelar o destino imediatamente
    document.addEventListener('click', (evento) => {
      const link = evento.target.closest('a[href^="#"]');
      if (!link) return;
      setTimeout(checarElementosNoScroll, 100);
      setTimeout(checarElementosNoScroll, 400);
      setTimeout(checarElementosNoScroll, 800);
    }, { passive: true });

    // Sinaliza que JS está ativo e pronto para revelações somente após a inicialização ter sucesso
    raiz.classList.add('js-ready', 'revelar-ativo');
  }

  /* ── 5.1 Parallax Suave nas Imagens das Seções (Desktop apenas) ────────── */
  function inicializarParallaxImagens() {
    if (movimentoReduzido || window.innerWidth <= 768) return;

    const alvos = document.querySelectorAll(
      '.servico__foto img, .profissional__foto img, .local__foto img, .servico-hero__foto img, .perfil-hero__foto img'
    );
    if (!alvos.length) return;

    const itens = [];
    function recalcularDimensoes() {
      itens.length = 0;
      alvos.forEach((img) => {
        const container = img.closest('figure') || img.parentElement;
        const rect = container.getBoundingClientRect();
        itens.push({
          img: img,
          container: container,
          top: rect.top + window.scrollY,
          height: rect.height,
          ativo: false
        });
      });
    }
    recalcularDimensoes();

    let animando = false;
    function atualizarParallax() {
      animando = false;
      const scrollY = window.scrollY;
      const alturaJanela = window.innerHeight;
      const centroJanela = scrollY + alturaJanela / 2;

      itens.forEach((it) => {
        if (!it.ativo) return;
        const centroElemento = it.top + it.height / 2;
        const dist = centroJanela - centroElemento;
        const fator = Math.max(-1, Math.min(1, dist / (alturaJanela / 2)));
        const deslocamentoMax = it.height * 0.06;
        const translateY = -(fator * deslocamentoMax);
        it.img.style.setProperty('--parallax-y', `${translateY.toFixed(1)}px`);
      });
    }

    function onScroll() {
      if (!animando) {
        animando = true;
        requestAnimationFrame(atualizarParallax);
      }
    }

    const observadorParallax = new IntersectionObserver((entradas) => {
      let mudanca = false;
      entradas.forEach((entrada) => {
        const item = itens.find((it) => it.container === entrada.target);
        if (item) {
          item.ativo = entrada.isIntersecting;
          if (entrada.isIntersecting) mudanca = true;
        }
      });
      if (mudanca) {
        onScroll();
      }
    }, { threshold: 0, rootMargin: '60px 0px 60px 0px' });

    itens.forEach((it) => observadorParallax.observe(it.container));
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        itens.forEach((it) => it.img.style.removeProperty('--parallax-y'));
        return;
      }
      recalcularDimensoes();
      onScroll();
    }, { passive: true });
  }

  /* ── 5.2 Destaque de Etapa Ativa ao Passar pelo Centro da Tela ─────────── */
  function inicializarDestaqueEtapas() {
    if (movimentoReduzido) return;
    const listas = document.querySelectorAll('.servico-lista');
    if (!listas.length) return;

    const itens = [];
    listas.forEach((lista) => {
      const lis = lista.querySelectorAll('li');
      let ehNumerada = false;
      lis.forEach((li) => {
        if (/\b\d+\.\s+/.test(li.textContent)) {
          ehNumerada = true;
        }
      });
      if (ehNumerada) {
        lista.classList.add('lista-etapas-ativa');
        lis.forEach((li) => itens.push(li));
      }
    });

    if (!itens.length) return;

    let animando = false;
    function atualizarDestaque() {
      animando = false;
      const topoJanela = window.innerHeight * 0.25;
      const fundoJanela = window.innerHeight * 0.75;

      itens.forEach((li) => {
        const rect = li.getBoundingClientRect();
        const centro = rect.top + rect.height / 2;
        if (centro >= topoJanela && centro <= fundoJanela) {
          li.classList.add('etapa-ativa');
        } else {
          li.classList.remove('etapa-ativa');
        }
      });
    }

    window.addEventListener('scroll', () => {
      if (!animando) {
        animando = true;
        requestAnimationFrame(atualizarDestaque);
      }
    }, { passive: true });

    atualizarDestaque();
  }

  /* ── 5.3 Aceleração Dinâmica do Marquee no Scroll (Desktop apenas) ─────── */
  function inicializarAceleracaoMarquee() {
    if (movimentoReduzido || window.innerWidth <= 768) return;
    const trilho = document.querySelector('.faixa__trilho');
    if (!trilho) return;

    let ultimoScrollY = window.scrollY;
    let ultimoTempo = performance.now();
    let timerRetorno = null;

    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) return;
      const agora = performance.now();
      const dt = agora - ultimoTempo;
      if (dt > 16) {
        const dy = Math.abs(window.scrollY - ultimoScrollY);
        const velocidade = dy / dt; // pixels por milissegundo
        ultimoScrollY = window.scrollY;
        ultimoTempo = agora;

        // Limita a aceleração a no máximo 1.6x
        const fator = Math.min(1.6, 1.0 + velocidade * 0.35);
        trilho.style.animationPlaybackRate = String(fator.toFixed(2));

        clearTimeout(timerRetorno);
        timerRetorno = setTimeout(() => {
          trilho.style.animationPlaybackRate = '1';
        }, 600);
      }
    }, { passive: true });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      inicializarReveals();
      inicializarParallaxImagens();
      inicializarDestaqueEtapas();
      inicializarAceleracaoMarquee();
    }).catch(() => {
      inicializarReveals();
      inicializarParallaxImagens();
      inicializarDestaqueEtapas();
      inicializarAceleracaoMarquee();
    });
  } else {
    inicializarReveals();
    inicializarParallaxImagens();
    inicializarDestaqueEtapas();
    inicializarAceleracaoMarquee();
  }

  /* ── 5.1 Pausa do Marquee fora da Viewport ────────────────────────────────────────────── */
  const faixas = document.querySelectorAll('.faixa');
  if ('IntersectionObserver' in window && faixas.length && !movimentoReduzido) {
    const observadorFaixa = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.remove('pausada');
        } else {
          entrada.target.classList.add('pausada');
        }
      });
    }, { threshold: 0, rootMargin: '100px 0px' });

    faixas.forEach((faixa) => {
      observadorFaixa.observe(faixa);
    });

    document.addEventListener('visibilitychange', () => {
      faixas.forEach((f) => {
        if (document.hidden) {
          f.classList.add('pausada');
        } else {
          const r = f.getBoundingClientRect();
          if (r.bottom >= 0 && r.top <= window.innerHeight) {
            f.classList.remove('pausada');
          }
        }
      });
    });
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

