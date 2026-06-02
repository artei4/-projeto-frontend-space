#  OME-Tech Orion — Painel de Controle de Missão

Este repositório contém o ecossistema de software do **Robô Orion**, um protótipo operacional voltado para o monitoramento térmico e radiológico em ambientes espaciais hostis. O projeto é dividido em uma camada de interface semântica e responsiva (Front-End Design) e um motor lógico simulado por eventos (Web Development).

---

##  Parte 1: Front-End Design & Design Thinking

###  Usuário Definido e Tarefa Crítica
* **Usuário:** Operadores de Missão Aeroespacial e Engenheiros de Controle de Bordo da OME-Tech. São profissionais que trabalham sob alta pressão psicológica e fadiga visual, monitorando múltiplos fluxos de dados simultâneos.
* **Tarefa Crítica:** Identificar anomalias operacionais (como superaquecimento ou picos de radiação gama) e disparar protocolos de mitigação de risco antes que ocorra a perda total dos apêndices robóticos em Subterra.

###  Justificativa da Direção Visual
> *Numa missão espacial, o ilegível é igual ao invisível.*

A paleta de cores foi desenvolvida sob o conceito **Yellow Tech / Cyber Gold**:
* **Fundo (`#0b0f19`):** Um cinza-espacial profundo (não 100% preto) que reduz o cansaço dos olhos em ambientes escuros e elimina reflexos fantasmas no monitor.
* **Elementos de Destaque (`#facc15`):** O Amarelo Cyber é utilizado em bordas técnicas, ícones e títulos em fonte *EB Garamond*. Por possuir alta frequência de onda visual, ele salta aos olhos do operador, indicando prioridade de leitura.
* **Glow e Contraste:** O contraste entre o texto claro e o fundo escuro cumpre com folga a proporção de **14:1**, superando o nível **WCAG AA** exigido para missões de segurança.

###  Visão Geral das Telas e Responsividade
O painel foi projetado sob o conceito de **HUD de Tela Única (Single Dashboard Page)**, dividido em quatro quadrantes lógicos: Header de Identificação, Grid de Telemetria Dinâmica, Central de Logs Históricos e Formulário de Diretivas.

A responsividade é gerenciada de forma fluida e por **Breakpoints declarados via CSS Media Queries**:
* **Desktop (Telas largas):** Exibição em Grid de 3 colunas para as telemetrias, permitindo leitura horizontal rápida.
* **Tablet (Até 768px):** O Grid se reorganiza automaticamente em 2 colunas, expandindo os cards para facilitar o toque em telas sensíveis.
* **Mobile (Até 480px):** O layout colapsa para uma coluna única e empilhada. A tabela de logs históricos recebe um contêiner com `overflow-x: auto`, permitindo scroll horizontal isolado para que as colunas de dados nunca esmaguem ou quebrem o viewport do smartphone.

###  Acessibilidade Implementada (WCAG AA)
* **Semântica Estrutural:** Uso rigoroso de tags HTML5 (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) eliminando o *div soup* e permitindo que leitores de tela indexem a página perfeitamente.
* **Foco Navegável (Focus Indicators):** Elementos interativos possuem a propriedade `:focus` configurada com bordas tracejadas amareladas em `dashed`. Caso o mouse do operador quebre, ele pode navegar por 100% do painel usando a tecla `Tab`.
* **Aria Labels e Atributos:** Todos os cards possuem `tabindex="0"` e `aria-label` descritivos, traduzindo gráficos e telemetrias em áudio legível para softwares de acessibilidade.

###  Como Abrir e Executar o Projeto
Por se tratar de uma aplicação front-end pura:
1. Baixe os arquivos `index.html`, `style.css` e `script.js` para uma mesma pasta na sua máquina.
2. Dê um duplo clique no arquivo `index.html` para abri-lo diretamente em qualquer navegador moderno (Chrome, Edge, Firefox ou Safari).
3. *Dica de Desenvolvimento:* Caso faça alterações no CSS, utilize o comando **`Ctrl + F5`** (Windows) ou `Cmd + Shift + R` (Mac) para recarregar a página limpando o cache de renderização.

---

##  Parte 2: Web Development & Lógica

##  Manual de Interatividade (Para o Professor)

Esta seção serve como guia prático de testes para a avaliação das interações do DOM e eventos do BOM via JavaScript.

###  Cenário 1: Teste de Entrada de Dados e Validação (Formulário)
* **Onde clicar/o que fazer:** Role até a seção **"Registro de Diretiva Técnica Manual"**.
  1. No campo de texto, digite letras (ex: `abc`) e clique em "Enviar". O sistema aplicará uma validação via código e disparará um `alert()` nativo bloqueando a operação.
  2. Mude o subsistema para **"Atualizar os níveis de radiação"**, digite o valor numérico `350` no input e clique em **"Enviar Telemetria"**.
* **O que acontece na tela:** * O JavaScript captura o evento de submit, intercepta o dado e injeta instantaneamente o valor de `350 mSv/h` no card de Radiação.
  * O card muda de cor de verde para **vermelho crítico** (`text-danger`).
  * A caixa superior de **Alerta Crítico de Radiação** surge na tela piscando em vermelho.
  * O status do servo é atualizado via DOM para `180° (FECHADO)`.
  * Um novo log com o timestamp exato da máquina é inserido na primeira linha da tabela de históricos.

###  Cenário 2: Teste de Recursos do BOM (Temporizador Controlado)
* **Onde clicar/o que fazer:** No formulário, localize o seletor **"Frequência de Atualização Automática"**. Mude de "Apenas Manual" para **"A cada 2 Segundos"** e clique no botão de Enviar.
* **O que acontece na tela:**
  * O JavaScript limpa a memória e inicia um loop ascríncrono via `setInterval()`.
  * A cada 2 segundos, a tela passará a **mudar sozinha**, simulando a recepção de dados via satélite com pequenas oscilações geradas por uma lógica matemática de `Math.random()`.
  * Para travar os dados e retornar ao controle manual estável, basta selecionar "Apenas Manual" e enviar o formulário novamente.

###  Cenário 3: Mitigação de Risco por Evento de Clique (Botões de Ação)
* **Onde clicar/o que fazer:** Com o sistema em estado crítico (Radiação acima de 100 ou Temperatura acima de 250), clique no botão **"FORÇAR APÊNDICES MODALIDADE PRT"** ou **"ACIONAR DISPOSITIVO AQD"**.
* **O que acontece na tela:**
  * O JavaScript escuta o evento de clique e dispara a função `transicaoSuave()`.
  * Através de um loop de frames rodando a 60 FPS com `setInterval`, os valores numéricos começam a **decair suavemente em tempo real** na tela (efeito regressivo de animação por código) até retornarem às marcas seguras.
  * Assim que o valor entra na margem segura, as caixas de erro somem e as cores do HUD voltam para o verde nominal.

###  Cenário 4: Injeção Dinâmica e Gráficos (Cliques nos Cards)
* **Onde clicar/o que fazer:** Clique (ou navegue via `Tab` e pressione `Enter`) sobre qualquer um dos três cards superiores de Telemetria (Temperatura, Radiação ou Servo).
* **O que acontece na tela:**
  * O JavaScript altera a propriedade CSS do painel de modal para `display: flex`.
  * Um overlay escuro cobre a tela e um painel centralizado é gerado dinamicamente.
  * O motor do script integra os arrays de dados históricos acumulados com a biblioteca **Chart.js**, renderizando um gráfico de linhas dinâmico com a cor correspondente do sensor.
  * Clique no botão **"✖"** ou fora do modal para fechá-lo de forma limpa.

---

###  Tecnologias Utilizadas
* **FED:** HTML5 Semântico, CSS3 Advanced (Grid Layout, Flexbox, Media Queries).
* **WD:** JavaScript ES6+ Puro (Manipulação de DOM, Eventos, BOM e Programação Assíncrona).
* **Componentes:** Lucide Icons Vector API & Chart.js Engine v4.
