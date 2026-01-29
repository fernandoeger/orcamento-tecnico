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

function salvarOrcamento() {
  const orcamento = {
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    cliente: document.getElementById('cliente').value.trim(),
    aparelho: document.getElementById('descricaoAparelho').value.trim(),
    maoObraIncluida: document.getElementById('incluirMaoObra').checked,
    valorMaoObra: parseFloat(document.getElementById('valorMaoObra').value) || 0,
    servicos: Array.from(document.querySelectorAll('#servicosContainer .servico-item')).map(div => {
      const checkbox = div.querySelector('input[type="checkbox"]');
      const input = div.querySelector('input[type="number"]');
      return {
        nome: input.getAttribute('data-item'),
        selecionado: checkbox.checked,
        valor: parseFloat(input.value) || 0
      };
    }),
    pecas: Array.from(document.querySelectorAll('input.peca')).map(input => ({
      nome: input.getAttribute('data-item'),
      valor: parseFloat(input.value) || 0
    })),
    outrosDesc: document.getElementById('outrosDesc').value.trim(),
    observacoes: document.getElementById('observacoes').value.trim()
  };

  let historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  historico.unshift(orcamento);
  localStorage.setItem('orcamentos', JSON.stringify(historico));

  alert('Orçamento salvo com sucesso!');
  recalcular();
}

function fecharHistorico() {
  document.getElementById('modalHistorico').style.display = 'none';
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
      info.style.cursor = 'pointer';
      info.innerHTML = `
        <strong>${orc.cliente || 'Cliente não informado'}</strong>
        - ${orc.aparelho || 'Sem descrição'}<br>
        <small>${orc.data}</small>
      `;
      info.onclick = () => carregarOrcamento(orc);

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = '🗑️';
      btnExcluir.className = 'btn danger';
      btnExcluir.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Excluir este orçamento?')) {
          historico.splice(index, 1);
          localStorage.setItem('orcamentos', JSON.stringify(historico));
          mostrarHistorico();
        }
      };

      li.appendChild(info);
      li.appendChild(btnExcluir);
      lista.appendChild(li);
    });
  }

  document.getElementById('modalHistorico').style.display = 'block';
}

function fecharHistorico() {
  document.getElementById('modalHistorico').style.display = 'none';
}

function carregarOrcamento(orc) {
  document.getElementById('cliente').value = orc.cliente || '';
  document.getElementById('descricaoAparelho').value = orc.aparelho || '';

  const maoCheck = document.getElementById('incluirMaoObra');
  maoCheck.checked = orc.maoObraIncluida || false;

  const maoInput = document.getElementById('valorMaoObra');
  maoInput.value = orc.valorMaoObra || 120;
  maoInput.disabled = !maoCheck.checked;

  if (Array.isArray(orc.servicos)) {
    orc.servicos.forEach(s => {
      const cb = document.querySelector(`#servicosContainer input[type="checkbox"][data-item="${s.nome}"]`);
      const input = document.querySelector(`#servicosContainer input[type="number"][data-item="${s.nome}"]`);
      if (cb && input) {
        cb.checked = s.selecionado;
        input.disabled = !s.selecionado;
        input.value = s.valor;
      }
    });
  }

  if (Array.isArray(orc.pecas)) {
    orc.pecas.forEach(p => {
      const input = document.querySelector(`input.peca[data-item="${p.nome}"]`);
      if (input) input.value = p.valor;
    });
  }

  document.getElementById('outrosDesc').value = orc.outrosDesc || '';
  document.getElementById('observacoes').value = orc.observacoes || '';

  fecharHistorico();
  recalcular();
}

function lancarNoCaixa() {
  const totalText = document.getElementById('custo').innerText;
  const valor = Number(
    totalText.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
  );

  if (!valor || valor <= 0) {
    alert('Calcule o orçamento antes de lançar no caixa.');
    return;
  }

  const cliente = document.getElementById('cliente').value || 'Cliente não informado';
  const aparelho = document.getElementById('descricaoAparelho').value || 'Aparelho não informado';

  const movimento = {
    tipo: 'entrada',
    descricao: `Orçamento – ${cliente} (${aparelho})`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  };

  localStorage.setItem('caixa_pendente', JSON.stringify(movimento));
  window.location.href = 'caixa.html';
}
