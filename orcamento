// ===================== CONFIG =====================
const LUCRO_PECAS = 1.25;

// ===================== SERVIÇOS =====================
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

function formatBR(v) {
  return (parseFloat(v) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ===================== RENDER SERVIÇOS =====================
function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  if (!container) return;

  container.innerHTML = '';

  for (const [nome, preco] of Object.entries(PRECOS_SUGERIDOS)) {
    const div = document.createElement('div');
    div.className = 'servico-item';
    div.innerHTML = `
      <input type="checkbox">
      <label>${nome}</label>
      <input type="number" value="${preco}" step="0.01" disabled>
    `;

    const chk = div.querySelector('input[type="checkbox"]');
    const input = div.querySelector('input[type="number"]');

    chk.addEventListener('change', () => {
      input.disabled = !chk.checked;
      if (!chk.checked) input.value = 0;
      recalcular();
    });

    input.addEventListener('input', recalcular);

    container.appendChild(div);
  }
}

// ===================== CÁLCULO =====================
function recalcular() {
  let total = 0;

  document.querySelectorAll('#servicosContainer .servico-item').forEach(div => {
    const chk = div.querySelector('input[type="checkbox"]');
    const val = div.querySelector('input[type="number"]');
    if (chk.checked) total += parseFloat(val.value || 0);
  });

  document.querySelectorAll('input.peca').forEach(input => {
    total += (parseFloat(input.value || 0) * LUCRO_PECAS);
  });

  document.getElementById('custo').innerText = 'R$ ' + formatBR(total);
}

// ===================== SALVAR ORÇAMENTO =====================
function salvarOrcamento() {
  const cliente = document.getElementById('cliente')?.value || '';
  const aparelho = document.getElementById('descricaoAparelho')?.value || '';
  const totalTexto = document.getElementById('custo').innerText;

  const servicos = [];
  document.querySelectorAll('#servicosContainer .servico-item').forEach(div => {
    const chk = div.querySelector('input[type="checkbox"]');
    const input = div.querySelector('input[type="number"]');

    servicos.push({
      nome: input.previousElementSibling.innerText,
      selecionado: chk.checked,
      valor: parseFloat(input.value) || 0
    });
  });

  const pecas = [];
  document.querySelectorAll('input.peca').forEach(input => {
    pecas.push({
      nome: input.getAttribute('data-item'),
      valor: parseFloat(input.value) || 0
    });
  });

  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');

  historico.unshift({
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    cliente,
    aparelho,
    servicos,
    pecas,
    totalTexto,
    pecasCompradas: false,
    pago: false
  });

  localStorage.setItem('orcamentos', JSON.stringify(historico));
  alert('Orçamento salvo com sucesso!');
}

// ===================== HISTÓRICO =====================
function mostrarHistorico() {
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  historico.forEach((orc, index) => {
    const li = document.createElement('li');

    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${orc.cliente || 'Cliente não informado'}</strong><br>
      <small>${orc.data}</small><br>
      <small>Status:
        ${orc.pecasCompradas ? '🧺 Peças compradas' : '📝 Orçado'}
        ${orc.pago ? ' | 💰 Pago' : ''}
      </small>
    `;
    info.style.cursor = 'pointer';
    info.onclick = () => carregarOrcamento(orc);
    li.appendChild(info);

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn danger';
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Excluir este orçamento?')) {
        historico.splice(index, 1);
        localStorage.setItem('orcamentos', JSON.stringify(historico));
        mostrarHistorico();
      }
    };
    li.appendChild(btnExcluir);

    const btnPecas = document.createElement('button');
    btnPecas.className = 'btn secondary';
    btnPecas.textContent = orc.pecasCompradas ? '✔️ Peças compradas' : '🧺 Comprar peças';
    btnPecas.disabled = orc.pecasCompradas;
    btnPecas.onclick = (e) => {
      e.stopPropagation();
      confirmarCompraPecas(orc.id);
    };
    li.appendChild(btnPecas);

    const btnPago = document.createElement('button');
    btnPago.className = 'btn';
    btnPago.textContent = orc.pago ? '✔️ Pago' : '💰 Confirmar pagamento';
    btnPago.disabled = orc.pago;
    btnPago.onclick = (e) => {
      e.stopPropagation();
      confirmarPagamento(orc.id);
    };
    li.appendChild(btnPago);

    lista.appendChild(li);
  });

  document.getElementById('modalHistorico').style.display = 'block';
}

function fecharHistorico() {
  document.getElementById('modalHistorico').style.display = 'none';
}

// ===================== CAIXA =====================
function confirmarCompraPecas(id) {
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const orc = historico.find(o => o.id === id);
  if (!orc || orc.pecasCompradas) return;

  if (!confirm('Confirmar compra das peças?')) return;

  const caixa = JSON.parse(localStorage.getItem('livroCaixa') || '[]');

  orc.pecas.forEach(p => {
    if (p.valor > 0) {
      caixa.unshift({
        id: Date.now() + Math.random(),
        tipo: 'saida',
        descricao: `Compra de peça - ${p.nome}`,
        valor: p.valor,
        data: new Date().toLocaleString('pt-BR')
      });
    }
  });

  orc.pecasCompradas = true;
  localStorage.setItem('livroCaixa', JSON.stringify(caixa));
  localStorage.setItem('orcamentos', JSON.stringify(historico));
  mostrarHistorico();
}

function confirmarPagamento(id) {
  const historico = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const orc = historico.find(o => o.id === id);
  if (!orc || orc.pago) return;

  if (!confirm('Confirmar pagamento?')) return;

  const caixa = JSON.parse(localStorage.getItem('livroCaixa') || '[]');

  caixa.unshift({
    id: Date.now(),
    tipo: 'entrada',
    descricao: `Pagamento orçamento - ${orc.cliente || 'Cliente'}`,
    valor: calcularTotalOrcamento(orc),
    data: new Date().toLocaleString('pt-BR')
  });

  orc.pago = true;
  localStorage.setItem('livroCaixa', JSON.stringify(caixa));
  localStorage.setItem('orcamentos', JSON.stringify(historico));
  mostrarHistorico();
}

function calcularTotalOrcamento(orc) {
  let total = 0;

  orc.servicos.forEach(s => {
    if (s.selecionado) total += s.valor;
  });

  orc.pecas.forEach(p => {
    total += p.valor * LUCRO_PECAS;
  });

  return total;
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  renderizarServicos();
  recalcular();
});
