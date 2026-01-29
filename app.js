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
  const numericValue = parseFloat(value) || 0;
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function sumValues(selector){
  const nodes = document.querySelectorAll(selector);
  return Array.from(nodes)
    .map(i => parseFloat(i.value || 0))
    .reduce((a, b) => a + b, 0);
}

function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  container.innerHTML = '';

  for (const [servico, preco] of Object.entries(PRECOS_SUGERIDOS)) {
    const div = document.createElement('div');
    div.className = 'servico-item';
    div.innerHTML = `
      <input type="checkbox" data-item="${servico}">
      <label>${servico}</label>
      <input type="number" class="valor servico" data-item="${servico}" value="${preco}" disabled>
    `;
    container.appendChild(div);
  }

  document.querySelectorAll('#servicosContainer input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function () {
      const input = this.parentElement.querySelector('input[type="number"]');
      input.disabled = !this.checked;
      if (!this.checked) input.value = 0;
      recalcular();
    });
  });

  document.querySelectorAll('#servicosContainer input[type="number"]').forEach(input => {
    input.addEventListener('input', recalcular);
  });
}

function getItensCobrados(){
  const itens = [];

  if (document.getElementById('incluirMaoObra').checked) {
    const valor = parseFloat(document.getElementById('valorMaoObra').value || 0);
    if (valor > 0) itens.push({ nome: 'Mão de Obra', valor });
  }

  document.querySelectorAll('#servicosContainer .servico-item').forEach(div => {
    const cb = div.querySelector('input[type="checkbox"]');
    const input = div.querySelector('input[type="number"]');
    if (cb.checked) {
      const valor = parseFloat(input.value || 0);
      if (valor > 0) itens.push({ nome: input.dataset.item, valor });
    }
  });

  document.querySelectorAll('input.peca').forEach(input => {
    const valor = parseFloat(input.value || 0);
    if (valor > 0) {
      let nome = input.dataset.item;
      if (nome === 'Outros' && document.getElementById('outrosDesc').value.trim()) {
        nome = `Outros (${document.getElementById('outrosDesc').value.trim()})`;
      }
      itens.push({ nome, valor: valor * 1.25 });
    }
  });

  return itens;
}

function recalcular(){
  const itens = getItensCobrados();
  const total = itens.reduce((s, i) => s + i.valor, 0);
  document.getElementById('custo').innerText = 'R$ ' + formatBR(total);

  const tbody = document.querySelector('#cobrancaTable tbody');
  tbody.innerHTML = '';

  if (!itens.length) {
    const row = tbody.insertRow();
    row.insertCell().innerText = 'Nenhum item/serviço cobrado.';
    row.insertCell().innerText = '';
    return;
  }

  itens.forEach(item => {
    const row = tbody.insertRow();
    row.insertCell().innerText = item.nome;
    row.insertCell().innerText = 'R$ ' + formatBR(item.valor);
  });
}

function salvarOrcamento(){
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');

  historico.unshift({
    data: new Date().toLocaleString('pt-BR'),
    cliente: document.getElementById('cliente').value,
    aparelho: document.getElementById('descricaoAparelho').value,
    total: document.getElementById('custo').innerText
  });

  localStorage.setItem('orcamentos', JSON.stringify(historico));
  alert('Orçamento salvo com sucesso!');
}

function mostrarHistorico() {
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  if (historico.length === 0) {
    lista.innerHTML = '<li>Nenhum orçamento salvo ainda.</li>';
  } else {
    historico.forEach((orc, index) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'flex-start';

      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = `
        <strong>${orc.cliente || 'Cliente não informado'}</strong> - ${orc.aparelho || 'Sem descrição'}<br>
        <small>${orc.data}</small>
      `;
      info.style.cursor = 'pointer';
      info.onclick = () => carregarOrcamento(orc);

      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn danger';
      btnExcluir.style.padding = '4px 8px';
      btnExcluir.style.fontSize = '0.8rem';
      btnExcluir.style.marginLeft = '10px';
      btnExcluir.textContent = '🗑️';
      btnExcluir.title = 'Excluir este orçamento';
      btnExcluir.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Excluir orçamento de "${orc.cliente || 'Cliente não informado'}" (${orc.data})?`)) {
          let historicoAtual = JSON.parse(localStorage.getItem('orcamentos') || '[]');
          historicoAtual.splice(index, 1);
          localStorage.setItem('orcamentos', JSON.stringify(historicoAtual));
          mostrarHistorico();
          alert('Orçamento excluído com sucesso!');
        }
      };

      li.appendChild(info);
      li.appendChild(btnExcluir);
      lista.appendChild(li);
    });
  }

  document.getElementById('modalHistorico').style.display = 'block';
}


document.addEventListener('DOMContentLoaded', () => {
  renderizarServicos();
  recalcular();
});

window.addEventListener('keydown', function(e){
  if((e.ctrlKey || e.metaKey) && e.key === 's'){
    e.preventDefault();
    salvarOrcamento();
  }
});
