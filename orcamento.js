// ================== ORÇAMENTO ==================

const PRECOS_SUGERIDOS = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "Formatação + Backup": 100,
  "Reballing": 250,
  "Atualização de BIOS": 80,
  "Diagnóstico": 30,
  "Troca de teclado (mão de obra)": 90,
  "Instalação de drivers": 50
};

function formatBR(value){
  return (parseFloat(value) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  container.innerHTML = '';

  for (const [servico, preco] of Object.entries(PRECOS_SUGERIDOS)) {
    const div = document.createElement('div');
    div.className = 'servico-item';
    div.innerHTML = `
      <input type="checkbox">
      <label>${servico}</label>
      <input type="number" value="${preco}" step="0.01" disabled>
    `;

    const checkbox = div.querySelector('input[type="checkbox"]');
    const input = div.querySelector('input[type="number"]');

    checkbox.addEventListener('change', () => {
      input.disabled = !checkbox.checked;
      if (!checkbox.checked) input.value = 0;
      recalcular();
    });

    input.addEventListener('input', recalcular);

    container.appendChild(div);
  }
}

function recalcular() {
  let total = 0;

  document.querySelectorAll('.servico-item').forEach(div => {
    const chk = div.querySelector('input[type="checkbox"]');
    const val = div.querySelector('input[type="number"]');
    if (chk.checked) total += parseFloat(val.value || 0);
  });

  document.querySelectorAll('input.peca').forEach(i => {
    total += (parseFloat(i.value || 0) * 1.25);
  });

  document.getElementById('custo').innerText = 'R$ ' + formatBR(total);
}

function salvarOrcamento() {
  const total = document.getElementById('custo').innerText;
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');

  historico.unshift({
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    total
  });

  localStorage.setItem('orcamentos', JSON.stringify(historico));
  alert('Orçamento salvo!');
}

// ================== LIVRO CAIXA ==================

function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function salvarCaixa(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

function salvarMovimentoCaixa() {
  const tipo = document.getElementById('caixaTipo').value;
  const descricao = document.getElementById('caixaDescricao').value.trim();
  const valor = parseFloat(document.getElementById('caixaValor').value);

  if (!descricao || !valor || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    id: Date.now(),
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR')
  };

  const caixa = getCaixa();
  caixa.unshift(movimento);
  salvarCaixa(caixa);

  document.getElementById('caixaDescricao').value = '';
  document.getElementById('caixaValor').value = '';

  atualizarResumoCaixa();
}

function atualizarResumoCaixa() {
  const caixa = getCaixa();

  let entradas = 0;
  let saidas = 0;

  caixa.forEach(item => {
    if (item.tipo === 'entrada') entradas += item.valor;
    else saidas += item.valor;
  });

  document.getElementById('totalEntradas').innerText = formatBR(entradas);
  document.getElementById('totalSaidas').innerText = formatBR(saidas);
  document.getElementById('saldoCaixa').innerText = formatBR(entradas - saidas);

  const lista = document.getElementById('listaCaixa');
  lista.innerHTML = '';

  caixa.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕' : '➖'} ${item.descricao}</strong>
      <br><small>${item.data}</small>
      <span style="float:right">R$ ${formatBR(item.valor)}</span>
    `;
    lista.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarServicos();
  atualizarResumoCaixa();
});
