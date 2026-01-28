// =======================
// SERVIÇOS PADRÃO
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

// ================= RENDER =================
function renderServicos(){
  const div = document.getElementById('servicos');
  div.innerHTML='';
  for(const [nome,valor] of Object.entries(SERVICOS)){
    div.innerHTML+=`
      <label>
        <input type="checkbox" data-valor="${valor}">
        ${nome} (R$ ${valor})
      </label>
    `;
  }
}

function renderPecas(){
  const div = document.getElementById('pecas');
  div.innerHTML='';
  PECAS.forEach(p=>{
    div.innerHTML+=`
      <label>${p}</label>
      <input type="number" class="peca" data-nome="${p}" placeholder="Custo">
    `;
  });
}

// ================= CÁLCULO =================
function recalcular(){
  let total = 0;

  document.querySelectorAll('#servicos input[type="checkbox"]').forEach(c=>{
    if(c.checked) total += Number(c.dataset.valor);
  });

  if(chkMaoObra.checked){
    total += Number(valorMaoObra.value||0);
  }

  document.querySelectorAll('.peca').forEach(p=>{
    const custo = Number(p.value||0);
    if(custo>0) total += custo*1.3;
  });

  document.getElementById('total').innerText =
    'R$ '+total.toLocaleString('pt-BR',{minimumFractionDigits:2});
}

// ================= SALVAR =================
function salvarOrcamento(){
  const itens = [];
  document.querySelectorAll('#servicos input[type="checkbox"]').forEach(c=>{
    if(c.checked){
      itens.push({nome:c.parentElement.textContent,valor:Number(c.dataset.valor)});
    }
  });

  document.querySelectorAll('.peca').forEach(p=>{
    const custo = Number(p.value||0);
    if(custo>0){
      itens.push({nome:p.dataset.nome,valor:custo*1.3});
    }
  });

  if(chkMaoObra.checked){
    itens.push({nome:'Mão de obra',valor:Number(valorMaoObra.value)});
  }

  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  h.unshift({
    id:Date.now(),
    cliente:cliente.value,
    aparelho:aparelho.value,
    data:new Date().toLocaleString('pt-BR'),
    itens
  });
  localStorage.setItem('orcamentos',JSON.stringify(h));
  alert('Orçamento salvo');
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded',()=>{
  renderServicos();
  renderPecas();

  chkMaoObra.onchange=()=>{
    valorMaoObra.disabled=!chkMaoObra.checked;
    recalcular();
  };

  document.body.addEventListener('input',recalcular);
});
// ================= HISTÓRICO =================
function getHistorico(){
  return JSON.parse(localStorage.getItem('orcamentos')||'[]');
}
function setHistorico(h){
  localStorage.setItem('orcamentos',JSON.stringify(h));
}

function mostrarHistorico(){
  const modal = document.getElementById('modalHistorico');
  const ul = document.getElementById('listaHistorico');

  ul.innerHTML = '';
  const h = getHistorico();

  if(h.length === 0){
    ul.innerHTML = '<li>Nenhum orçamento salvo.</li>';
  }

  h.forEach((o,i)=>{
    const total = o.itens.reduce((s,x)=>s + x.valor, 0);

    const li = document.createElement('li');
    li.style.marginBottom = '10px';
    li.innerHTML = `
      <strong>${o.cliente || 'Cliente'}</strong><br>
      ${o.aparelho || ''}<br>
      Total: R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
    `;

    const btnPdf = document.createElement('button');
    btnPdf.textContent = '📄 PDF';
    btnPdf.onclick = () => gerarPDF(o);

    const btnPago = document.createElement('button');
    btnPago.textContent = o.pago ? '✔️ Pago' : '💰 Confirmar pagamento';
    btnPago.disabled = o.pago;
    btnPago.onclick = () => confirmarPagamento(o.id);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = () => {
      if(confirm('Excluir orçamento?')){
        h.splice(i,1);
        setHistorico(h);
        mostrarHistorico();
      }
    };

    li.append(btnPdf, btnPago, btnExcluir);
    ul.appendChild(li);
  });

  modal.style.display = 'block';
}

function fecharHistorico(){
  document.getElementById('modalHistorico').style.display = 'none';
}
    };

    li.append(btnPdf, btnPago, btnExcluir);
    ul.appendChild(li);
  });

  modalHistorico.style.display='block';
}

function fecharHistorico(){
  modalHistorico.style.display='none';
}

// ================= PDF =================
function gerarPDF(o){
  let html = `
    <h2>Orçamento Técnico</h2>
    <p><strong>Cliente:</strong> ${o.cliente||''}</p>
    <p><strong>Aparelho:</strong> ${o.aparelho||''}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><th>Item</th><th>Valor</th></tr>
  `;
  let total=0;
  o.itens.forEach(i=>{
    total+=i.valor;
    html+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
  });
  html+=`</table><h3>Total: R$ ${total.toFixed(2)}</h3>`;

  const w = window.open('','_blank');
  w.document.write(html);
  w.print();
}

// ================= CAIXA =================
function confirmarPagamento(id){
  const h = getHistorico();
  const o = h.find(x=>x.id===id);
  if(!o||o.pago) return;

  const total = o.itens.reduce((s,x)=>s+x.valor,0);
  const caixa = JSON.parse(localStorage.getItem('livroCaixa')||'[]');

  caixa.unshift({
    id:Date.now(),
    tipo:'entrada',
    descricao:`Pagamento orçamento - ${o.cliente||''}`,
    valor:total,
    data:new Date().toLocaleString('pt-BR')
  });

  localStorage.setItem('livroCaixa',JSON.stringify(caixa));
  o.pago=true;
  setHistorico(h);

  alert('Entrada registrada no Caixa');
  mostrarHistorico();
}

// EXPORTS
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = fecharHistorico;

// ================= DOM READY =================
let cliente, aparelho, chkMaoObra, valorMaoObra, totalEl, modalHistorico;

document.addEventListener('DOMContentLoaded', () => {
  cliente = document.getElementById('cliente');
  aparelho = document.getElementById('aparelho');
  chkMaoObra = document.getElementById('chkMaoObra');
  valorMaoObra = document.getElementById('valorMaoObra');
  totalEl = document.getElementById('total');
  modalHistorico = document.getElementById('modalHistorico');

  renderServicos();
  renderPecas();

  chkMaoObra.onchange = () => {
    valorMaoObra.disabled = !chkMaoObra.checked;
    recalcular();
  };

  document.body.addEventListener('input', recalcular);
});