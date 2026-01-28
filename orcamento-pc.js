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
  "SSD","HD","Memória RAM","Bateria","Teclado","Tela",
  "Cooler","DC Jack","Placa-mãe","Fonte","Placa de vídeo"
];

// ================= VARS =================
let cliente, aparelho, chkMaoObra, valorMaoObra, totalEl, modal, lista;

// ================= INIT =================
document.addEventListener('DOMContentLoaded',()=>{
  cliente = cliente = document.getElementById('cliente');
  aparelho = document.getElementById('aparelho');
  chkMaoObra = document.getElementById('chkMaoObra');
  valorMaoObra = document.getElementById('valorMaoObra');
  totalEl = document.getElementById('total');
  modal = document.getElementById('modalHistorico');
  lista = document.getElementById('listaHistorico');

  renderServicos();
  renderPecas();

  chkMaoObra.onchange = ()=>{
    valorMaoObra.disabled = !chkMaoObra.checked;
    recalcular();
  };

  document.body.addEventListener('input',recalcular);
});

// ================= RENDER =================
function renderServicos(){
  servicos.innerHTML='';
  Object.entries(SERVICOS).forEach(([n,v])=>{
    servicos.innerHTML+=`
      <label><input type="checkbox" data-valor="${v}"> ${n} (R$ ${v})</label>
    `;
  });
}

function renderPecas(){
  pecas.innerHTML='';
  PECAS.forEach(p=>{
    pecas.innerHTML+=`
      <label>${p}</label>
      <input type="number" class="peca" data-nome="${p}">
    `;
  });
}

// ================= CALC =================
function recalcular(){
  let total = 0;

  document.querySelectorAll('#servicos input:checked').forEach(c=>{
    total += Number(c.dataset.valor);
  });

  if(chkMaoObra.checked){
    total += Number(valorMaoObra.value||0);
  }

  document.querySelectorAll('.peca').forEach(p=>{
    if(p.value>0) total += p.value * 1.3;
  });

  totalEl.innerText = 'R$ '+total.toLocaleString('pt-BR',{minimumFractionDigits:2});
}

// ================= HISTÓRICO =================
function salvarOrcamento(){
  const itens = [];
  document.querySelectorAll('#servicos input:checked').forEach(c=>{
    itens.push({nome:c.parentElement.textContent,valor:+c.dataset.valor});
  });

  document.querySelectorAll('.peca').forEach(p=>{
    if(p.value>0) itens.push({nome:p.dataset.nome,valor:p.value*1.3});
  });

  if(chkMaoObra.checked){
    itens.push({nome:'Mão de obra',valor:+valorMaoObra.value});
  }

  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  h.unshift({
    id:Date.now(),
    cliente:cliente.value,
    aparelho:aparelho.value,
    itens,
    pago:false
  });

  localStorage.setItem('orcamentos',JSON.stringify(h));
  alert('Orçamento salvo');
}

function mostrarHistorico(){
  lista.innerHTML='';
  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');

  if(!h.length){
    lista.innerHTML='<li>Nenhum orçamento</li>';
    modal.style.display='block';
    return;
  }

  h.forEach(o=>{
    const total = o.itens.reduce((s,x)=>s+x.valor,0);
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${o.cliente||'Cliente'}</strong><br>
      ${o.aparelho||''}<br>
      Total: R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
    `;
    lista.appendChild(li);
  });

  modal.style.display='block';
}

function fecharHistorico(){
  modal.style.display='none';
}

// EXPORTS
window.recalcular = recalcular;
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = fecharHistorico;