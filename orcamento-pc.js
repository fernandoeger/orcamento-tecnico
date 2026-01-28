// =======================
// SERVIÇOS PADRÃO
// =======================
const SERVICOS_PC = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "Formatação + Backup": 100,
  "Reballing": 250,
  "Atualização de BIOS": 80,
  "Diagnóstico": 30,
  "Troca de teclado (mão de obra)": 90,
  "Instalação de drivers": 50
};

// =======================
// UTIL
// =======================
function moeda(v){
  return (Number(v)||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
}

// =======================
// RENDER SERVIÇOS
// =======================
function renderizarServicos(){
  const c = document.getElementById('servicosContainer');
  c.innerHTML = '';

  for(const [nome,valor] of Object.entries(SERVICOS_PC)){
    const d = document.createElement('div');
    d.className = 'servico-item';
    d.innerHTML = `
      <input type="checkbox">
      <label>${nome}</label>
      <input type="number" class="valor servico" value="${valor}" disabled>
    `;

    const chk = d.children[0];
    const inp = d.children[2];

    chk.onchange = ()=>{
      inp.disabled = !chk.checked;
      if(!chk.checked) inp.value = 0;
      recalcular();
    };
    inp.oninput = recalcular;

    c.appendChild(d);
  }
}

// =======================
// ITENS COBRADOS
// =======================
function getItens(){
  const itens = [];

  // mão de obra
  if(incluirMaoObra.checked){
    const v = Number(valorMaoObra.value||0);
    if(v>0) itens.push({nome:'Mão de Obra',valor:v});
  }

  // serviços
  document.querySelectorAll('.servico-item').forEach(d=>{
    if(d.children[0].checked){
      itens.push({
        nome: d.children[1].innerText,
        valor: Number(d.children[2].value||0)
      });
    }
  });

  // peças (+25%)
  document.querySelectorAll('input.peca').forEach(i=>{
    const v = Number(i.value||0);
    if(v>0){
      let nome = i.dataset.item;
      if(nome==='Outros' && outrosDesc.value){
        nome += ` (${outrosDesc.value})`;
      }
      itens.push({nome,valor:v*1.25});
    }
  });

  return itens;
}

// =======================
// CALCULAR
// =======================
function recalcular(){
  valorMaoObra.disabled = !incluirMaoObra.checked;

  const itens = getItens();
  const total = itens.reduce((s,i)=>s+i.valor,0);
  custo.innerText = 'R$ ' + moeda(total);

  const tbody = document.querySelector('#cobrancaTable tbody');
  tbody.innerHTML = '';

  if(itens.length===0){
    tbody.innerHTML = '<tr><td colspan="2">Nenhum item</td></tr>';
  }else{
    itens.forEach(i=>{
      const tr = tbody.insertRow();
      tr.insertCell().innerText = i.nome;
      tr.insertCell().innerText = 'R$ '+moeda(i.valor);
      tr.cells[1].className='right';
    });
  }
}

// =======================
// INIT
// =======================
document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  document.querySelectorAll('input,textarea').forEach(e=>{
    e.addEventListener('input',recalcular);
  });
  recalcular();
});