// ================= DADOS FIXOS =================
const SERVICOS = {
  "Limpeza + pasta térmica": 100,
  "Formatação": 60,
  "Backup + Formatação": 100,
  "Diagnóstico": 30,
  "Drivers": 50
};

const PECAS = [
  "SSD","HD","Memória RAM","Bateria","Teclado","Tela",
  "Cooler","DC Jack","Placa-mãe","Fonte","Placa de vídeo"
];

// ================= VARIÁVEIS =================
let cliente, aparelho, chkMaoObra, valorMaoObra, totalEl;
let modalHistorico, listaHistorico;

// ================= INIT =================
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

  chkMaoObra.addEventListener('change', () => {
    valorMaoObra.disabled = !chkMaoObra.checked;
    recalcular();
  });

  document.body.addEventListener('input', recalcular);
});

// ================= RENDER =================
function renderServicos(){
  servicos.innerHTML = '';
  Object.entries(SERVICOS).forEach(([nome,valor])=>{
    servicos.innerHTML += `
      <label>
        <input type="checkbox" data-valor="${valor}">
        ${nome} (R$ ${valor})
      </label>
    `;
  });
}

function renderPecas(){
  pecas.innerHTML = '';
  PECAS.forEach(p=>{
    pecas.innerHTML += `
      <label>${p}</label>
      <input type="number" class="peca" data-nome="${p}">
    `;
  });
}

// ================= CALCULAR =================
function recalcular(){
  let total = 0;

  document.querySelectorAll('#servicos input:checked').forEach(c=>{
    total += Number(c.dataset.valor);
  });

  if(chkMaoObra.checked){
    total += Number(valorMaoObra.value || 0);
  }

  document.querySelectorAll('.peca').forEach(p=>{
    if(p.value > 0) total += p.value * 1.3;
  });

  totalEl.innerText =
    'R$ ' + total.toLocaleString('pt-BR',{minimumFractionDigits:2});
}

// ================= STORAGE =================
function getHistorico(){
  return JSON.parse(localStorage.getItem('orcamentos') || '[]');
}

function setHistorico(h){
  localStorage.setItem('orcamentos', JSON.stringify(h));
}

// ================= SALVAR =================
function salvarOrcamento(){
  const itens = [];

  document.querySelectorAll('#servicos input:checked').forEach(c=>{
    itens.push({
      nome: c.parentElement.textContent.trim(),
      valor: Number(c.dataset.valor)
    });
  });

  document.querySelectorAll('.peca').forEach(p=>{
    if(p.value > 0){
      itens.push({
        nome: p.dataset.nome,
        valor: p.value * 1.3
      });
    }
  });

  if(chkMaoObra.checked){
    itens.push({
      nome: 'Mão de obra',
      valor: Number(valorMaoObra.value)
    });
  }

  const h = getHistorico();
  h.unshift({
    id: Date.now(),
    cliente: cliente.value,
    aparelho: aparelho.value,
    itens,
    pago: false,
    data: new Date().toLocaleString('pt-BR')
  });

  setHistorico(h);
  alert('Orçamento salvo');
}

// ================= HISTÓRICO =================
function mostrarHistorico(){
  listaHistorico.innerHTML = '';
  const h = getHistorico();

  if(h.length === 0){
    listaHistorico.innerHTML = '<li>Nenhum orçamento salvo.</li>';
    modalHistorico.style.display = 'block';
    return;
  }

  h.forEach((o,index)=>{
    const total = o.itens.reduce((s,x)=>s+x.valor,0);
    const li = document.createElement('li');
    li.style.marginBottom = '12px';

    li.innerHTML = `
      <strong>${o.cliente || 'Cliente'}</strong><br>
      ${o.aparelho || ''}<br>
      <small>${o.data}</small><br>
      <strong>Total:</strong> R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
    `;

    // 💰 BOTÃO CAIXA
    const btnCaixa = document.createElement('button');
    btnCaixa.textContent = o.pago ? '✔️ Pago' : '💰 Enviar pro Caixa';
    btnCaixa.disabled = o.pago;
    btnCaixa.onclick = () => {
      if(o.pago) return;
      if(!confirm('Registrar pagamento no caixa?')) return;

      const caixa = JSON.parse(localStorage.getItem('livroCaixa')||'[]');
      caixa.unshift({
        id: Date.now(),
        tipo: 'entrada',
        descricao: `Pagamento orçamento - ${o.cliente || ''}`,
        valor: total,
        data: new Date().toLocaleString('pt-BR')
      });

      localStorage.setItem('livroCaixa', JSON.stringify(caixa));
      o.pago = true;
      h[index] = o;
      setHistorico(h);
      mostrarHistorico();
    };

    // 🗑️ BOTÃO EXCLUIR
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = () => {
      if(confirm('Excluir orçamento?')){
        h.splice(index,1);
        setHistorico(h);
        mostrarHistorico();
      }
    };

    li.appendChild(document.createElement('br'));
    li.appendChild(btnCaixa);
    li.appendChild(btnExcluir);

    listaHistorico.appendChild(li);
  });

  modalHistorico.style.display = 'block';
}

function fecharHistorico(){
  modalHistorico.style.display = 'none';
}

// ================= EXPORTS (CHROME SAFE) =================
window.recalcular = recalcular;
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = fecharHistorico;