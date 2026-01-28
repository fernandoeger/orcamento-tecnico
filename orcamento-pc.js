// =======================
// DADOS FIXOS
// =======================
const SERVICOS = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "Formatação + Backup": 100,
  "Reballing": 250,
  "Atualização de BIOS": 80,
  "Diagnóstico": 30,
  "Troca de teclado (mão de obra)": 90,
  "Instalação de drivers": 50
};

const PECAS = [
  "SSD","HD","Memória RAM","Bateria","Teclado","Tela / Display",
  "Flat da tela","Alto-falante","Webcam","Cooler","DC Jack",
  "Carcaça","Touchpad","Placa Wi-Fi","Placa Bluetooth",
  "Microfone","Dobradiças","BIOS","Placa-mãe",
  "Fonte","Placa de vídeo","Processador","Cooler CPU",
  "Gabinete","Ventoinhas","Cabo SATA"
];

// =======================
// VARIÁVEIS DOM
// =======================
let cliente, aparelho, chkMaoObra, valorMaoObra, totalEl, modalHistorico, listaHistorico;

// =======================
// INIT
// =======================
document.addEventListener('DOMContentLoaded', () => {
  cliente = document.getElementById('cliente');
  aparelho = document.getElementById('aparelho');
  chkMaoObra = document.getElementById('chkMaoObra');
  valorMaoObra = document.getElementById('valorMaoObra');
  totalEl = document.getElementById('total');
  modalHistorico = document.getElementById('modalHistorico');
  listaHistorico = document.getElementById('listaHistorico');

  renderServicos();
  renderPecas();

  chkMaoObra.onchange = () => {
    valorMaoObra.disabled = !chkMaoObra.checked;
    recalcular();
  };

  document.body.addEventListener('input', recalcular);
});

// =======================
// RENDER
// =======================
function renderServicos(){
  const div = document.getElementById('servicos');
  div.innerHTML = '';
  Object.entries(SERVICOS).forEach(([nome, valor]) => {
    div.innerHTML += `
      <label>
        <input type="checkbox" data-valor="${valor}">
        ${nome} (R$ ${valor})
      </label>
    `;
  });
}

function renderPecas(){
  const div = document.getElementById('pecas');
  div.innerHTML = '';
  PECAS.forEach(p => {
    div.innerHTML += `
      <label>${p}</label>
      <input type="number" class="peca" data-nome="${p}" placeholder="Custo">
    `;
  });
}

// =======================
// CÁLCULO
// =======================
function recalcular(){
  let total = 0;

  document.querySelectorAll('#servicos input:checked').forEach(c => {
    total += Number(c.dataset.valor);
  });

  if (chkMaoObra.checked) {
    total += Number(valorMaoObra.value || 0);
  }

  document.querySelectorAll('.peca').forEach(p => {
    const custo = Number(p.value || 0);
    if (custo > 0) total += custo * 1.3;
  });

  totalEl.innerText = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// =======================
// HISTÓRICO
// =======================
function getHistorico(){
  return JSON.parse(localStorage.getItem('orcamentos') || '[]');
}

function setHistorico(h){
  localStorage.setItem('orcamentos', JSON.stringify(h));
}

function salvarOrcamento(){
  const itens = [];

  document.querySelectorAll('#servicos input:checked').forEach(c => {
    itens.push({ nome: c.parentElement.textContent.trim(), valor: Number(c.dataset.valor) });
  });

  document.querySelectorAll('.peca').forEach(p => {
    const custo = Number(p.value || 0);
    if (custo > 0) itens.push({ nome: p.dataset.nome, valor: custo * 1.3 });
  });

  if (chkMaoObra.checked) {
    itens.push({ nome: 'Mão de obra', valor: Number(valorMaoObra.value) });
  }

  const h = getHistorico();
  h.unshift({
    id: Date.now(),
    cliente: cliente.value,
    aparelho: aparelho.value,
    data: new Date().toLocaleString('pt-BR'),
    itens,
    pago: false
  });

  setHistorico(h);
  alert('Orçamento salvo');
}

function mostrarHistorico(){
  listaHistorico.innerHTML = '';
  const h = getHistorico();

  if (h.length === 0) {
    listaHistorico.innerHTML = '<li>Nenhum orçamento salvo.</li>';
  }

  h.forEach(o => {
    const total = o.itens.reduce((s, i) => s + i.valor, 0);
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${o.cliente || 'Cliente'}</strong><br>
      ${o.aparelho || ''}<br>
      Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    `;
    listaHistorico.appendChild(li);
  });

  modalHistorico.style.display = 'block';
}

function fecharHistorico(){
  modalHistorico.style.display = 'none';
}

// =======================
// EXPORTS
// =======================
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = fecharHistorico;
window.recalcular = recalcular;