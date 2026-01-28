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