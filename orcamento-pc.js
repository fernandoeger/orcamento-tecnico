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
  const modal = document.getElementById('modalHistorico');
  const ul = document.getElementById('listaHistorico');

  ul.innerHTML = '';
  const h = JSON.parse(localStorage.getItem('orcamentos') || '[]');

  if(h.length === 0){
    ul.innerHTML = '<li>Nenhum orçamento salvo.</li>';
    modal.style.display = 'block';
    return;
  }

  h.forEach((o, index) => {
    const total = o.itens.reduce((s, x) => s + x.valor, 0);

    const li = document.createElement('li');
    li.style.marginBottom = '12px';

    li.innerHTML = `
      <strong>${o.cliente || 'Cliente não informado'}</strong><br>
      ${o.aparelho || ''}<br>
      <small>${o.data}</small><br>
      <strong>Total:</strong> R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits:2})}
    `;

    // BOTÃO PAGAMENTO
    const btnPago = document.createElement('button');
    btnPago.textContent = o.pago ? '✔️ Pago' : '💰 Confirmar pagamento';
    btnPago.disabled = o.pago;
    btnPago.style.marginRight = '6px';

    btnPago.onclick = () => {
      if(o.pago) return;
      if(!confirm('Confirmar pagamento e registrar no Caixa?')) return;

      const caixa = JSON.parse(localStorage.getItem('livroCaixa') || '[]');

      caixa.unshift({
        id: Date.now(),
        tipo: 'entrada',
        descricao: `Pagamento orçamento - ${o.cliente || 'Cliente'}`,
        valor: total,
        data: new Date().toLocaleString('pt-BR')
      });

      localStorage.setItem('livroCaixa', JSON.stringify(caixa));

      o.pago = true;
      h[index] = o;
      localStorage.setItem('orcamentos', JSON.stringify(h));

      alert('Pagamento registrado no Livro Caixa');
      mostrarHistorico();
    };

    // BOTÃO EXCLUIR
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = () => {
      if(confirm('Excluir orçamento?')){
        h.splice(index, 1);
        localStorage.setItem('orcamentos', JSON.stringify(h));
        mostrarHistorico();
      }
    };

    li.appendChild(document.createElement('br'));
    li.appendChild(btnPago);
    li.appendChild(btnExcluir);

    ul.appendChild(li);
  });

  modal.style.display = 'block';
}

// =======================
// EXPORTS
// =======================
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = fecharHistorico;
window.recalcular = recalcular;