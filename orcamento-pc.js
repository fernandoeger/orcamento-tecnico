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

// ================= STORAGE =================
function getOrcamentos(){
  return JSON.parse(localStorage.getItem('orcamentos')||'[]');
}
function setOrcamentos(v){
  localStorage.setItem('orcamentos',JSON.stringify(v));
}

// ================= RENDER SERVIÇOS =================
function renderServicos(){
  const div = document.getElementById('servicos');
  div.innerHTML='';

  for(const [nome,valor] of Object.entries(SERVICOS)){
    const linha = document.createElement('div');
    linha.innerHTML = `
      <label>
        <input type="checkbox" data-nome="${nome}">
        ${nome}
      </label>
      <input type="number" value="${valor}" disabled>
    `;

    const chk = linha.querySelector('input[type=checkbox]');
    const inp = linha.querySelector('input[type=number]');

    chk.onchange = ()=>{
      inp.disabled = !chk.checked;
      if(!chk.checked) inp.value = 0;
      recalcular();
    };
    inp.oninput = recalcular;

    div.appendChild(linha);
  }
}

// ================= CALCULAR =================
function recalcular(){
  let total = 0;

  if(document.getElementById('chkMaoObra').checked){
    total += Number(document.getElementById('valorMaoObra').value||0);
  }

  document.querySelectorAll('#servicos div').forEach(l=>{
    if(l.querySelector('input[type=checkbox]').checked){
      total += Number(l.querySelector('input[type=number]').value||0);
    }
  });

  document.querySelectorAll('.peca').forEach(p=>{
    total += Number(p.value||0);
  });

  document.getElementById('total').innerText =
    total.toLocaleString('pt-BR',{minimumFractionDigits:2});
}

// ================= SALVAR =================
function salvarOrcamento(){
  const itens = [];

  if(document.getElementById('chkMaoObra').checked){
    itens.push({nome:'Mão de obra',valor:Number(valorMaoObra.value)});
  }

  document.querySelectorAll('#servicos div').forEach(l=>{
    if(l.querySelector('input[type=checkbox]').checked){
      itens.push({
        nome:l.querySelector('input[type=checkbox]').dataset.nome,
        valor:Number(l.querySelector('input[type=number]').value)
      });
    }
  });

  document.querySelectorAll('.peca').forEach(p=>{
    if(p.value>0){
      itens.push({nome:p.dataset.nome,valor:Number(p.value)});
    }
  });

  const orc = {
    id:Date.now(),
    data:new Date().toLocaleString('pt-BR'),
    cliente:cliente.value,
    aparelho:aparelho.value,
    itens,
    pago:false
  };

  const h = getOrcamentos();
  h.unshift(orc);
  setOrcamentos(h);

  alert('Orçamento salvo');
}

// ================= HISTÓRICO =================
function mostrarHistorico(){
  const ul = listaHistorico;
  ul.innerHTML='';
  getOrcamentos().forEach((o,i)=>{
    const li = document.createElement('li');
    const total = o.itens.reduce((s,x)=>s+x.valor,0);

    li.innerHTML = `
      <strong>${o.cliente||'Cliente'}</strong><br>
      ${o.aparelho||''}<br>
      Total: R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
    `;

    const del = document.createElement('button');
    del.textContent='🗑️';
    del.className='btn danger';
    del.onclick=()=>{
      if(confirm('Excluir orçamento?')){
        const h=getOrcamentos();
        h.splice(i,1);
        setOrcamentos(h);
        mostrarHistorico();
      }
    };

    li.appendChild(del);
    ul.appendChild(li);
  });

  historico.style.display='block';
}
function fecharHistorico(){
  historico.style.display='none';
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded',()=>{
  renderServicos();
  recalcular();
  chkMaoObra.onchange=()=>{
    valorMaoObra.disabled=!chkMaoObra.checked;
    recalcular();
  };
});