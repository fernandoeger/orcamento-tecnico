// ================== CONFIG ==================
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

// ================== UTIL ==================
function formatBR(value){
  return (Number(value) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ================== SERVIÇOS ==================
function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  container.innerHTML = '';

  Object.entries(PRECOS_SUGERIDOS).forEach(([nome, preco]) => {
    const div = document.createElement('div');
    div.className = 'servico-item';
    div.innerHTML = `
      <input type="checkbox" data-item="${nome}">
      <label>${nome}</label>
      <input type="number" class="valor servico" data-item="${nome}" value="${preco}" disabled>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const input = cb.parentElement.querySelector('input[type="number"]');
      input.disabled = !cb.checked;
      if (!cb.checked) input.value = 0;
      recalcular();
    });
  });

  container.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', recalcular);
  });
}

// ================== ITENS ==================
function getItensCobrados(){
  const itens = [];

  if (document.getElementById('incluirMaoObra').checked) {
    const v = Number(document.getElementById('valorMaoObra').value || 0);
    if (v > 0) itens.push({ nome: 'Mão de Obra', valor: v });
  }

  document.querySelectorAll('#servicosContainer .servico-item').forEach(div => {
    const cb = div.querySelector('input[type="checkbox"]');
    const input = div.querySelector('input[type="number"]');
    if (cb.checked && input.value > 0) {
      itens.push({ nome: input.dataset.item, valor: Number(input.value) });
    }
  });

  document.querySelectorAll('input.peca').forEach(input => {
    const v = Number(input.value || 0);
    if (v > 0) {
      let nome = input.dataset.item;
      if (nome === 'Outros' && document.getElementById('outrosDesc').value.trim()) {
        nome = `Outros (${document.getElementById('outrosDesc').value.trim()})`;
      }
      itens.push({ nome, valor: v * 1.25 });
    }
  });

  return itens;
}

// ================== CALCULAR ==================
function recalcular(){
  const itens = getItensCobrados();
  const total = itens.reduce((s,i)=>s+i.valor,0);
  document.getElementById('custo').innerText = 'R$ ' + formatBR(total);

  const tbody = document.querySelector('#cobrancaTable tbody');
  tbody.innerHTML = '';

  if (!itens.length) {
    const r = tbody.insertRow();
    r.insertCell().innerText = 'Nenhum item/serviço cobrado.';
    r.insertCell().innerText = '';
    return;
  }

  itens.forEach(i=>{
    const r = tbody.insertRow();
    r.insertCell().innerText = i.nome;
    r.insertCell().innerText = 'R$ ' + formatBR(i.valor);
  });
}

// ================== SALVAR ==================
function salvarOrcamento(){
  const orcamento = {
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    cliente: cliente.value.trim(),
    aparelho: descricaoAparelho.value.trim(),
    status: 'aberto',        // aberto | pago
    saidaLancada: false,    // controle de saída
    entradaLancada: false   // controle de entrada
    maoObraIncluida: incluirMaoObra.checked,
    valorMaoObra: Number(valorMaoObra.value||0),
    servicos: [...document.querySelectorAll('#servicosContainer .servico-item')].map(div=>{
      const cb = div.querySelector('input[type="checkbox"]');
      const input = div.querySelector('input[type="number"]');
      return { nome: input.dataset.item, selecionado: cb.checked, valor: Number(input.value||0) };
    }),
    pecas: [...document.querySelectorAll('input.peca')].map(i=>({
      nome:i.dataset.item, valor:Number(i.value||0)
    })),
    outrosDesc: outrosDesc.value,
    observacoes: observacoes.value
  };

  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  h.unshift(orcamento);
  localStorage.setItem('orcamentos', JSON.stringify(h));
  alert('Orçamento salvo!');
}

// ================== HISTÓRICO ==================
function mostrarHistorico(){
  const h = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const lista = listaHistorico;
  lista.innerHTML = '';

  if (!h.length){
    lista.innerHTML = '<li>Nenhum orçamento salvo.</li>';
    modalHistorico.style.display = 'block';
    return;
  }

  h.forEach((orc, i) => {
    const li = document.createElement('li');
    li.style.borderBottom = '1px solid #eee';
    li.style.padding = '8px 0';

    // ===== INFO =====
    const info = document.createElement('div');
    info.style.cursor = 'pointer';

    const statusTexto = orc.status === 'pago' ? 'PAGO' : 'EM ABERTO';
    const statusCor = orc.status === 'pago' ? 'green' : 'orange';

    info.innerHTML = `
      <strong>${orc.cliente || 'Cliente'}</strong> – ${orc.aparelho || ''}<br>
      <small>${orc.data || ''}</small><br>
      <small>
        Status: <strong style="color:${statusCor}">${statusTexto}</strong>
      </small>
    `;

    info.onclick = () => carregarOrcamento(orc);

    // ===== AÇÕES =====
    const acoes = document.createElement('div');
    acoes.style.marginTop = '6px';
    acoes.style.display = 'flex';
    acoes.style.gap = '6px';
    acoes.style.flexWrap = 'wrap';

    const b1 = document.createElement('button');
    b1.textContent = '➖ Saída';
    b1.onclick = e => {
      e.stopPropagation();
      lancarSaidaNoCaixa(orc);
      mostrarHistorico();
    };

    const b2 = document.createElement('button');
    b2.textContent = '➕ Entrada';
    b2.onclick = e => {
      e.stopPropagation();
      lancarEntradaNoCaixa(orc);
      mostrarHistorico();
    };

    const bx = document.createElement('button');
    bx.textContent = '🗑️';
    bx.onclick = e => {
      e.stopPropagation();
      if (!confirm('Excluir este orçamento?')) return;
      h.splice(i, 1);
      localStorage.setItem('orcamentos', JSON.stringify(h));
      mostrarHistorico();
    };

    // ===== DESATIVAÇÃO VISUAL =====
    if (orc.saidaLancada) {
      b1.disabled = true;
      b1.style.opacity = '0.5';
      b1.style.cursor = 'not-allowed';
    }

    if (orc.entradaLancada) {
      b2.disabled = true;
      b2.style.opacity = '0.5';
      b2.style.cursor = 'not-allowed';
    }

    acoes.append(b1, b2, bx);

    li.appendChild(info);
    li.appendChild(acoes);
    lista.appendChild(li);
  });

  modalHistorico.style.display = 'block';
}

// ================== CAIXA ==================
function calcularTotalOrcamento(orc){
  let t=0;
  if(orc.maoObraIncluida) t+=orc.valorMaoObra;
  orc.servicos.forEach(s=>{ if(s.selecionado) t+=s.valor; });
  orc.pecas.forEach(p=>{ t+=p.valor*1.25; });
  return t;
}
// 🔹 Total REAL das peças (sem lucro)
function calcularTotalPecasSemLucro(orc) {
  let total = 0;

  if (Array.isArray(orc.pecas)) {
    orc.pecas.forEach(p => {
      total += Number(p.valor || 0); // SEM * 1.25
    });
  }

  return total;
}
function salvarNoCaixa(m){
  const c = JSON.parse(localStorage.getItem('livroCaixa')||'[]');
  c.unshift({id:Date.now(),...m});
  localStorage.setItem('livroCaixa',JSON.stringify(c));
}

function lancarEntradaNoCaixa(orc) {
  if (orc.entradaLancada) {
    alert('Entrada já lançada para este orçamento.');
    return;
  }

  const valor = calcularTotalOrcamento(orc);
  if (!valor || valor <= 0) {
    alert('Orçamento sem valor.');
    return;
  }

  salvarNoCaixa({
    tipo: 'entrada',
    descricao: `Pagamento – ${orc.cliente}`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  orc.entradaLancada = true;
  orc.status = 'pago';
  atualizarOrcamento(orc);

  alert('Entrada lançada. Orçamento marcado como PAGO.');
}

function lancarSaidaNoCaixa(orc) {
  if (orc.saidaLancada) {
    alert('Saída já lançada para este orçamento.');
    return;
  }

  const valor = calcularTotalPecasSemLucro(orc);
  if (!valor || valor <= 0) {
    alert('Orçamento não possui peças.');
    return;
  }

  salvarNoCaixa({
    tipo: 'saida',
    descricao: `Compra de peças – ${orc.cliente}`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  orc.saidaLancada = true;
  atualizarOrcamento(orc);

  alert('Saída lançada com sucesso.');
}

  salvarNoCaixa({
    tipo: 'entrada',
    descricao: `Pagamento – ${orc.cliente || 'Cliente'} (${orc.aparelho || ''})`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  alert('Entrada lançada no Caixa (valor com lucro).');
}

function calcularLucroOrcamento(orc) {
  const entrada = calcularTotalOrcamento(orc); // com lucro
  const saida = calcularTotalPecasSemLucro(orc); // custo real
  return entrada - saida;
}

function atualizarOrcamento(orcAtualizado) {
  const lista = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const nova = lista.map(o => o.id === orcAtualizado.id ? orcAtualizado : o);
  localStorage.setItem('orcamentos', JSON.stringify(nova));
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  recalcular();
});