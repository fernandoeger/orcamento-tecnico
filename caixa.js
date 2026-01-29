// ================== LOCAL STORAGE ==================
function getCaixa() {
  return JSON.parse(localStorage.getItem('livroCaixa') || '[]');
}

function setCaixa(lista) {
  localStorage.setItem('livroCaixa', JSON.stringify(lista));
}

// ================== SALVAR MOVIMENTO MANUAL ==================
function salvarMovimento() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = Number(document.getElementById('valor').value);

  if (!descricao || valor <= 0) {
    alert('Preencha descrição e valor corretamente.');
    return;
  }

  const movimento = {
    id: Date.now().toString(),
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleString('pt-BR')
  };

  const caixa = getCaixa();
  caixa.unshift(movimento);
  setCaixa(caixa);

  renderTudo(caixa);

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
}

window.salvarMovimento = salvarMovimento;

// ================== RENDER GERAL ==================
function renderTudo(lista) {
  let entradas = 0;
  let saidas = 0;

  lista.forEach(i => {
    if (i.tipo === 'entrada') entradas += Number(i.valor);
    if (i.tipo === 'saida') saidas += Number(i.valor);
  });

  document.getElementById('entradas').innerText =
    entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saidas').innerText =
    saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  document.getElementById('saldo').innerText =
    (entradas - saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  renderLista(lista);
}

// ================== LISTA + EXCLUIR ==================
function renderLista(lista) {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  if (lista.length === 0) {
    ul.innerHTML = '<li>Nenhum movimento registrado.</li>';
    return;
  }

  lista.forEach(item => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'flex-start';
    li.style.gap = '10px';

    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${item.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</strong>
      — ${item.descricao}<br>
      <small>${item.data}</small>
    `;

    const ladoDireito = document.createElement('div');
    ladoDireito.style.textAlign = 'right';

    const valor = document.createElement('div');
    valor.innerText =
      'R$ ' + Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir movimento';
    btnExcluir.style.marginTop = '4px';
    btnExcluir.style.background = '#dc3545';
    btnExcluir.style.color = '#fff';
    btnExcluir.style.border = 'none';
    btnExcluir.style.borderRadius = '6px';
    btnExcluir.style.padding = '4px 8px';
    btnExcluir.style.cursor = 'pointer';

    btnExcluir.onclick = () => {
      if (!confirm('Deseja excluir este movimento?')) return;

      const atualizado = getCaixa().filter(i => i.id !== item.id);
      setCaixa(atualizado);
      renderTudo(atualizado);
    };

    ladoDireito.appendChild(valor);
    ladoDireito.appendChild(btnExcluir);

    li.appendChild(info);
    li.appendChild(ladoDireito);
    ul.appendChild(li);
  });
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
  const caixa = getCaixa();
  renderTudo(caixa);
});