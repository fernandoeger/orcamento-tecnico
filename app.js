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
  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  const lista = listaHistorico;
  lista.innerHTML = '';

  if (!h.length){
    lista.innerHTML = '<li>Nenhum orçamento salvo.</li>';
    modalHistorico.style.display='block';
    return;
  }

  h.forEach((orc,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${orc.cliente||'Cliente'}</strong> - ${orc.aparelho||''}<br><small>${orc.data}</small>`;
    li.style.cursor='pointer';
    li.onclick=()=>carregarOrcamento(orc);

    const acoes=document.createElement('div');

    const b1=document.createElement('button');
    b1.textContent='➖ Saída';
    b1.onclick=e=>{e.stopPropagation();lancarSaidaNoCaixa(orc);};

    const b2=document.createElement('button');
    b2.textContent='➕ Entrada';
    b2.onclick=e=>{e.stopPropagation();lancarEntradaNoCaixa(orc);};

    const bx=document.createElement('button');
    bx.textContent='🗑️';
    bx.onclick=e=>{
      e.stopPropagation();
      h.splice(i,1);
      localStorage.setItem('orcamentos',JSON.stringify(h));
      mostrarHistorico();
    };

    acoes.append(b1,b2,bx);
    li.appendChild(acoes);
    lista.appendChild(li);
  });

  modalHistorico.style.display='block';
}

function fecharHistorico(){
  modalHistorico.style.display='none';
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

function lancarSaidaNoCaixa(orc) {
  const valor = calcularTotalPecasSemLucro(orc);

  if (!valor || valor <= 0) {
    alert('Orçamento não possui peças para lançar como saída.');
    return;
  }

  salvarNoCaixa({
    tipo: 'saida',
    descricao: `Compra de peças – ${orc.cliente || 'Cliente'} (${orc.aparelho || ''})`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  alert('Saída lançada no Caixa (valor real das peças).');
}

function lancarEntradaNoCaixa(orc) {
  const valor = calcularTotalOrcamento(orc); // COM lucro

  if (!valor || valor <= 0) {
    alert('Orçamento sem valor.');
    return;
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

// ================== INIT ==================
document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  recalcular();
});