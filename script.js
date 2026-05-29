lucide.createIcons();

/* =========================================================
   1. SELEÇÃO DE ELEMENTOS DO DOM
   ========================================================= */
const telemetryCards = document.querySelectorAll(".telemetry-card");
const telemetryValues = document.querySelectorAll(".telemetry-value");

const temperaturaValue = telemetryValues[0];
const radiacaoValue = telemetryValues[1];
const servoValue = telemetryValues[2];

const alertBoxes = document.querySelectorAll(".alert-box");
const form = document.querySelector(".custom-form");
const componentSelect = document.querySelector("#component-select");
const powerInput = document.querySelector("#power-input");
const tempoSelect = document.querySelector("#tempo-select"); 
const actionButtons = document.querySelectorAll(".action-btn");
const logTableBody = document.querySelector(".data-table tbody");

/* =========================================================
   2. VARIÁVEIS DE ESTADO E HISTÓRICO DE TELEMETRIA
   ========================================================= */
let temperaturaAtual = 25.4;
let radiacaoAtual = 45;

let historicoTemperatura = [22, 23, 24, 25, 25.4];
let historicoRadiacao = [30, 35, 40, 42, 45];
let historicoServo = [0, 0, 0, 0, 0];
let telemetryChart = null;

// Armazena o ID do temporizador ativo do BOM
let intervaloSateliteId = null; 

/* =========================================================
   3. INJEÇÃO DINÂMICA DO MODAL (ESTRUTURA DO DOM VIA JS)
   ========================================================= */
const modalOverlay = document.createElement("div");
modalOverlay.classList.add("modal-overlay");
modalOverlay.innerHTML = `
    <div class="custom-modal">
        <button class="close-modal">✖</button>
        <h2 class="modal-title">TELEMETRIA DETALHADA</h2>
        <div class="modal-content">
            <p id="modal-info"></p>
            <canvas id="telemetryChart" width="350" height="180"></canvas>
        </div>
    </div>
`;
document.body.appendChild(modalOverlay);

const modalInfo = document.querySelector("#modal-info");
const closeModalBtn = document.querySelector(".close-modal");

/* =========================================================
   4. EVENTOS DE INTERAÇÃO (CLIQUES E MODAIS)
   ========================================================= */
telemetryCards.forEach((card, index) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
        modalOverlay.style.display = "flex";
        if(index === 0){
            modalInfo.innerHTML = `<strong>TEMPERATURA ATUAL:</strong> ${temperaturaAtual.toFixed(1)} °C`;
            criarGrafico("temperatura");
        }
        if(index === 1){
            modalInfo.innerHTML = `<strong>RADIAÇÃO ATUAL:</strong> ${radiacaoAtual.toFixed(0)} mSv/h`;
            criarGrafico("radiacao");
        }
        if(index === 2){
            modalInfo.innerHTML = `<strong>STATUS DO SERVO MECÂNICO:</strong> ${servoValue.textContent}`;
            criarGrafico("servo");
        }
    });
});

closeModalBtn.addEventListener("click", () => { modalOverlay.style.display = "none"; });
modalOverlay.addEventListener("click", (e) => { if(e.target === modalOverlay){ modalOverlay.style.display = "none"; } });

/* =========================================================
   5. LÓGICA DE CONTROLE, ALERTA E SEGURANÇA (DOM E BOM)
   ========================================================= */
function atualizarAlertas(){
    alertBoxes[0].style.display = "none";
    alertBoxes[1].style.display = "none";

    if(radiacaoAtual > 100){
        alertBoxes[0].style.display = "flex";
        servoValue.textContent = "180° (FECHADO)";
        servoValue.className = "telemetry-value text-danger";
    } else {
        servoValue.textContent = "0° (ABERTO)";
        servoValue.className = "telemetry-value text-highlight";
    }

    if(temperaturaAtual > 250){
        alertBoxes[1].style.display = "flex";
    }
}

function atualizarInterface(){
    temperaturaValue.textContent = `${temperaturaAtual.toFixed(1)} °C`;
    radiacaoValue.textContent = `${radiacaoAtual.toFixed(0)} mSv/h`;

    if(temperaturaAtual > 250){
        temperaturaValue.className = "telemetry-value text-danger";
    } else {
        temperaturaValue.className = "telemetry-value text-safe";
    }

    if(radiacaoAtual > 100){
        radiacaoValue.className = "telemetry-value text-danger";
    } else {
        radiacaoValue.className = "telemetry-value text-safe";
    }

    atualizarAlertas();

    const temp = parseFloat(temperaturaAtual.toFixed(1));
    const rad = parseFloat(radiacaoAtual.toFixed(0));
    const servoAngulo = radiacaoAtual > 100 ? 180 : 0;

    atualizarHistorico("temperatura", temp);
    atualizarHistorico("radiacao", rad);
    atualizarHistorico("servo", servoAngulo);
}

function adicionarLog(modulo, leitura, acao){
    const row = document.createElement("tr");
    const agora = new Date();
    const horario = agora.toLocaleTimeString("pt-BR");
    row.innerHTML = `
        <td>${horario}</td>
        <td>${modulo}</td>
        <td>${leitura}</td>
        <td>${acao}</td>
    `;
    logTableBody.prepend(row);
}

/* =========================================================
   6. CONTROLE DO TEMPORIZADOR DINÂMICO (REQUISITO PROFESSOR)
   ========================================================= */
function gerenciarTemporizador(tempoMs) {
    // Limpa loops ativos anteriores para evitar acúmulo de memória
    if (intervaloSateliteId) {
        clearInterval(intervaloSateliteId);
        intervaloSateliteId = null;
    }

    // Se o usuário escolheu um tempo automático (BOM), inicia o ciclo
    if (tempoMs > 0) {
        adicionarLog("Gerenciador BOM", `${tempoMs / 1000}s`, "Frequência automática ativada");
        
        intervaloSateliteId = setInterval(() => {
            // Gera oscilações automáticas de dados se o sistema estiver operando normal
            if (radiacaoAtual <= 100 && temperaturaAtual <= 250) {
                temperaturaAtual += (Math.random() * 6) - 3; 
                radiacaoAtual += Math.floor(Math.random() * 8) - 4;
                if(radiacaoAtual < 10) radiacaoAtual = 15;
                atualizarInterface();
            }
        }, tempoMs);
    } else {
        adicionarLog("Gerenciador BOM", "OFF", "Painel retornado para modo estático");
    }
}

/* =========================================================
   7. EVENTO DO FORMULÁRIO (DIRETIVAS E CONTROLE DE TEMPO)
   ========================================================= */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valor = parseFloat(powerInput.value);
    const tempoEscolhido = parseInt(tempoSelect.value);
    
    // Altera a frequência do timer conforme comando do usuário
    gerenciarTemporizador(tempoEscolhido);

    // Se houver valor digitado, processa a injeção manual
    if (!isNaN(valor)) {
        if(componentSelect.value === "laser"){
            temperaturaAtual = valor;
            adicionarLog("Módulo Térmico A0", `${valor} °C`, "Alteração manual de temperatura");
            if(valor > 250) { alert("[ALERTA BOM] Superaquecimento do núcleo superior a 250°C!"); }
        }
        if(componentSelect.value === "valvula"){
            radiacaoAtual = valor;
            adicionarLog("Potenciômetro Radiação A1", `${valor} mSv/h`, "Alteração manual de radiação");
            if(valor > 100) { alert("[ALERTA BOM] Emergência: Radiação acima dos limites seguros!"); }
        }
    }
    
    atualizarInterface();
    powerInput.value = "";
});

/* =========================================================
   8. TRANSIÇÕES E MITIGAÇÃO DE RISCO (BOTÕES DE AÇÃO)
   ========================================================= */
function transicaoSuave(tipo, alvo){
    const duracao = 5000;
    const fps = 60;
    const intervalo = 1000 / fps;
    let valorInicial = tipo === "temperatura" ? temperaturaAtual : radiacaoAtual;
    const diferenca = alvo - valorInicial;
    let tempoAtual = 0;

    const animacao = setInterval(() => {
        tempoAtual += intervalo;
        const progresso = tempoAtual / duracao;
        const novoValor = valorInicial + (diferenca * progresso);

        if(tipo === "temperatura"){ temperaturaAtual = novoValor; } 
        else { radiacaoAtual = novoValor; }

        atualizarInterface();
        if(progresso >= 1){ clearInterval(animacao); }
    }, intervalo);
}

actionButtons[0].addEventListener("click", () => {
    if(radiacaoAtual > 100){
        adicionarLog("Blindagem PRT", `${radiacaoAtual.toFixed(0)} mSv/h`, "Mitigação ativa: Comando de fechamento executado");
        transicaoSuave("radiacao", 45);
    }
});

actionButtons[1].addEventListener("click", () => {
    if(temperaturaAtual > 250){
        adicionarLog("Módulo AQD", `${temperaturaAtual.toFixed(1)} °C`, "Mitigação ativa: Sistema de arrefecimento acionado");
        transicaoSuave("temperatura", 25);
    }
});

function atualizarHistorico(tipo, valor){
    let historico = tipo === "temperatura" ? historicoTemperatura : (tipo === "radiacao" ? historicoRadiacao : historicoServo);
    if(historico[historico.length - 1] === valor){ return; }
    historico.push(valor);
    if(historico.length > 5){ historico.shift(); }
}

/* =========================================================
   9. INTEGRAÇÃO COM COMPONENTE CHART.JS
   ========================================================= */
function criarGrafico(tipo){
    const ctx = document.getElementById("telemetryChart").getContext("2d");
    let dados = tipo === "temperatura" ? historicoTemperatura : (tipo === "radiacao" ? historicoRadiacao : historicoServo);
    let label = tipo === "temperatura" ? "Temperatura °C" : (tipo === "radiacao" ? "Radiação mSv/h" : "Servo °");
    let cor = tipo === "temperatura" ? "#ff7b72" : (tipo === "radiacao" ? "#facc15" : "#7f5af0");

    if(telemetryChart){ telemetryChart.destroy(); }

    telemetryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["T1", "T2", "T3", "T4", "T5"],
            datasets: [{ label, data: dados, borderColor: cor, backgroundColor: cor, tension: 0.3 }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: "white" } } },
            scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white" } } }
        }
    });
}

// Inicializa a interface em modo estável e estático por padrão
atualizarInterface();