# Índice e Organização do Projeto — Lira Gomes Psicologia

Este documento centraliza o mapeamento de todos os arquivos de **código-fonte**, **direção**, **mídia (marca)** e **design system de referência** do site da **Lira Gomes Psicologia**.

---

## 1. Estrutura de Pastas Organizada

```text
Site Lira/
├── index.html                                    # Página inicial (Cabeçalho + Hero com vídeo em tela cheia)
├── favicon.ico                                   # Favicon multi-resolução (16×16, 32×32, 48×48)
├── design-system.html                            # Design System v2 de referência (tokens, componentes, movimento)
└── assets/
    ├── css/
    │   └── style.css                             # Estilos globais, tokens Lira Gomes, cabeçalho, hero e modal
    ├── js/
    │   └── main.js                               # Sincronia vídeo/texto, menu mobile e escolha de WhatsApp
    ├── direcao/                                  # Conteúdo, regras editoriais, SEO e manual da marca (Markdown)
    │   ├── 00-indice-do-projeto.md               # Este índice geral e guia rápido de referências
    │   ├── 01-direcao-completa-do-site.md        # Direção completa das 5 páginas, copy, regras editoriais e SEO
    │   ├── 02-questionario-estrategico.md        # Respostas oficiais de Lucas e Thais (dados, CRP, formação, bio)
    │   ├── 03-manual-da-marca.md                 # Identidade visual, paleta de cores, tipografia e tom de voz
    │   └── originais/                            # Documentos originais (.docx e .pdf) preservados
    │       ├── direcao-completa-do-site.docx
    │       ├── questionario-lira-gomes-psicologia.docx
    │       └── manual-da-marca-lira-gomes.pdf
    │
    └── marca/                                    # Arquivos de mídia otimizados em kebab-case
        ├── logos/
        │   ├── logo-lira-gomes-sem-fundo.webp         # Logo principal completa sem fundo (RGBA transparente) — 615×591
        │   ├── logo-lira-gomes-sem-fundo.png          # Logo principal completa sem fundo em PNG (RGBA) — 615×591
        │   ├── logo-lira-gomes-dourada-sem-fundo.webp # Logo dourada sem fundo para seções escuras/verdes (RGBA) — 615×591
        │   ├── logo-lira-gomes-dourada-sem-fundo.png  # Logo dourada sem fundo em PNG (RGBA) — 615×591
        │   ├── simbolo-lira-gomes-sem-fundo.webp      # Símbolo circular isolado verde/dourado sem fundo (RGBA) — 419×396
        │   ├── simbolo-lira-gomes-sem-fundo.png       # Símbolo circular isolado verde/dourado em PNG (RGBA) — 419×396
        │   ├── simbolo-lira-gomes-dourado-sem-fundo.webp # Símbolo circular isolado dourado sem fundo (RGBA) — 419×396
        │   ├── simbolo-lira-gomes-dourado-sem-fundo.png  # Símbolo circular isolado dourado em PNG (RGBA) — 419×396
        │   ├── logo-lira-gomes-fundo-claro.webp       # Logo oficial sobre fundo off-white (#F5F3ED) — 1365×768
        │   ├── logo-lira-gomes-fundo-verde.webp       # Logo oficial sobre fundo verde profundo (#263324) — 1365×768
        │   └── logo-lira-gomes-fundo-escuro.webp      # Logo oficial sobre fundo grafite escuro — 1365×768
        ├── profissionais/
        │   ├── thais-lira-gomes-recorte.webp       # Thais Lira Silva Gomes (recorte RGBA transparente) — 800×1202
        │   ├── thais-lira-gomes-fundo-branco.webp  # Thais Lira Silva Gomes (fundo branco limpo) — 800×1202
        │   ├── thais-lira-gomes-foto-original.webp # Thais Lira Silva Gomes (foto original fundo neutro) — 800×1201
        │   ├── lucas-roberto-recorte.webp          # Lucas Roberto Pereira Gomes (recorte RGBA transparente) — 800×1199
        │   ├── lucas-roberto-fundo-branco.webp     # Lucas Roberto Pereira Gomes (fundo branco limpo) — 800×1199
        │   └── lucas-roberto-foto-original.webp    # Lucas Roberto Pereira Gomes (foto original) — 800×1198
        └── videos/
            ├── hero-video-principal.webm         # Vídeo Hero principal (WebM, 1920×1080, 4.6 MB)
            └── hero-video-principal.mp4          # Vídeo Hero principal (MP4, 1920×1080, 3.2 MB)
```

---

## 2. Resumo Rápido de Tokens da Marca (Manual + Direção)

| Token / Função | Cor | HEX | Aplicação |
| :--- | :--- | :--- | :--- |
| **Institucional Principal** | Verde profundo | `#263324` | Símbolo, nome, títulos, cabeçalhos e fundos institucionais |
| **Secundária** | Verde oliva | `#59614B` | Elementos secundários, badges e variações suaves |
| **Acento Delicado** | Dourado areia | `#C8AE7D` | Detalhes sutis, linhas finas, divisores e ícones |
| **Fundo Principal** | Off-white quente | `#F5F3ED` | Fundo principal das páginas |
| **Texto Corrido** | Grafite suave | `#343631` | Textos longos, parágrafos e leitura principal |

### Tipografia
- **Títulos (`h1`–`h4`):** Serifada contemporânea (`Fraunces` / `Lora`).
- **Corpo, Navegação e Botões:** Sans-serif limpa e confortável (`Instrument Sans` / `Manrope`).

---

## 3. Resumo dos Profissionais e Contatos Confirmados

- **Clínica:** Lira Gomes Psicologia (`Psicologia • Neuropsicologia`)
- **Endereço:** R. Dep. João Sussumu Hirata, 940 — conjunto 14, sala 1 — Vila Andrade, São Paulo – SP, CEP 05715-010
- **Horário:** Segunda a sexta-feira, preferencialmente das 9h às 18h (mediante agendamento prévio)
- **Acessibilidade:** O edifício possui vaga de estacionamento pago, rampas e elevador, mas **o conjunto não comporta cadeirantes** (informar com transparência na página de contato).
- **Lucas Roberto Pereira Gomes:**
  - **Registro:** Psicólogo • CRP 06/205736
  - **WhatsApp:** `(11) 98467-7810` (`https://wa.me/5511984677810`)
  - **Instagram:** `https://www.instagram.com/lucasoroberto/`
  - **Formação:** Psicologia (UNINOVE) e Pós em Neuropsicologia (FAVENI)
  - **Atuação:** Psicoterapia para adultos (presencial e online — TDAH adulto, TEA nível 1, ansiedade, relacionamentos, autoconhecimento) e avaliação neuropsicológica.
- **Thais Lira Silva Gomes:**
  - **Registro:** Psicóloga e neuropsicóloga • CRP 06/180230
  - **WhatsApp:** `(11) 95067-3415` (`https://wa.me/5511950673415`)
  - **Formação:** Psicologia (UNISA) e Pós em Neuropsicologia (FAVENI)
  - **Atuação:** Avaliação neuropsicológica presencial (adolescentes e adultos — TDAH, TEA, altas habilidades/superdotação, atenção, memória, funções executivas, aprendizagem) e psicoterapia conforme demanda e agenda.
