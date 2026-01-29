// Preços sugeridos para serviços
const PRECOS_SUGERIDOS = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "formatação + Backup": 100,
  "Reballing": 250,
  "Atualização de BIOS": 80,
  "Diagnóstico": 30,
  "Troca de teclado (mão de obra)": 90,
  "Instalação de drivers": 50
};

function formatBR(value){
  return (parseFloat(value)||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
}

function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  for (const [nome, preco] of Object.entries(PRECOS_SUGERIDOS)) {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>
        <input type="checkbox" data-nome="${nome}">
        ${nome}
      </label>
      <input type="number" value="${preco}" disabled>
    `;
    const checkbox = div.querySelector('input[type=checkbox]');
    const input = div.querySelector('input[type=number]');
    checkbox.onchange = () => {
      input.disabled = !checkbox.checked;
      if (!checkbox.checked) input.value = 0;
      recalcular();
    };
    input.oninput = recalcular;
    container.appendChild(div);
  }
}

function recalcular(){
  let total = 0;

  document.querySelectorAll('#servicosContainer input[type=checkbox]').forEach(cb=>{
    if(cb.checked){
      total += parseFloat(cb.parentElement.nextElementSibling.value||0);
    }
  });

  document.querySelectorAll('.peca').forEach(p=>{
    total += (parseFloat(p.value||0) * 1.25);
  });

  if(document.getElementById('incluirMaoObra').checked){
    total += parseFloat(document.getElementById('valorMaoObra').value||0);
  }

  document.getElementById('custo').innerText = 'R$ ' + formatBR(total);
}

function salvarOrcamento(){
  const lista = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  lista.unshift({
    data: new Date().toLocaleString('pt-BR'),
    total: document.getElementById('custo').innerText
  });
  localStorage.setItem('orcamentos',JSON.stringify(lista));
  alert('Salvo!');
}

function mostrarHistorico(){
  alert('Histórico salvo no navegador');
}

document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  recalcular();
});
