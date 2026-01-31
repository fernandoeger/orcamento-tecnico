// ================== CONFIG ==================
const PRECOS_SUGERIDOS = {
  "Limpeza interna e troca de pasta térmica": 100,
  "Formatação": 60,
  "Formatação + Backup": 100,
  "Instalação de programas": 80,
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

// ================== EMPRESA / PDF ==================
function preencherDadosEmpresa() {
  if (!window.EMPRESA) return;

  const logo = document.getElementById('empresaLogo');
  const dados = document.getElementById('empresaDados');
  const cabecalhoPrint = document.getElementById('cabecalhoPrint');

  if (logo && EMPRESA.logo) {
    logo.src = EMPRESA.logo;
    logo.alt = EMPRESA.nome || '';
  }

  if (dados) {
    dados.innerHTML = `
      <strong>${EMPRESA.nome || ''}</strong><br>
      ${EMPRESA.slogan || ''}<br>
      CNPJ: ${EMPRESA.cnpj || ''}<br>
      ${EMPRESA.telefone || ''}<br>
      ${EMPRESA.endereco || ''}
    `;
  }

  if (cabecalhoPrint) {
    cabecalhoPrint.innerHTML = `
      <h1>${EMPRESA.nome || ''}</h1>
      <p>${EMPRESA.slogan || ''}</p>
      <p>CNPJ: ${EMPRESA.cnpj || ''}</p>
    `;
  }
}

// garante cabeçalho sempre antes do PDF
window.addEventListener('beforeprint', preencherDadosEmpresa);

// ================== SERVIÇOS ==================
function renderizarServicos() {
  const container = document.getElementById('servicosContainer');
  if (!container) return;

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

  if (incluirMaoObra && incluirMaoObra.checked) {
    const v = Number(valorMaoObra.value || 0);
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
      if (nome === 'Outros' && outrosDesc && outrosDesc.value.trim()) {
        nome = `Outros (${outrosDesc.value.trim()})`;
      }
      itens.push({ nome, valor: v * 1.25 });
    }
  });

  return itens;
}

// ================== CALCULAR ==================
function recalcular(){
  preencherDadosEmpresa();

  const itens = getItensCobrados();
  const total = itens.reduce((s,i)=>s+i.valor,0);

  if (custo) {
    custo.innerText = 'R$ ' + formatBR(total);
  }

  const tbody = document.querySelector('#cobrancaTable tbody');
  if (!tbody) return;

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
    cliente: cliente?.value?.trim() || '',
    aparelho: descricaoAparelho?.value?.trim() || '',
    status: 'aberto',
    saidaLancada: false,
    entradaLancada: false,
    maoObraIncluida: incluirMaoObra?.checked || false,
    valorMaoObra: Number(valorMaoObra?.value || 0),
    servicos: [...document.querySelectorAll('#servicosContainer .servico-item')].map(div=>{
      const cb = div.querySelector('input[type="checkbox"]');
      const input = div.querySelector('input[type="number"]');
      return {
        nome: input.dataset.item,
        selecionado: cb.checked,
        valor: Number(input.value || 0)
      };
    }),
    pecas: [...document.querySelectorAll('input.peca')].map(i=>({
      nome: i.dataset.item,
      valor: Number(i.value || 0)
    })),
    outrosDesc: outrosDesc?.value || '',
    observacoes: observacoes?.value || ''
  };

  const h = JSON.parse(localStorage.getItem('orcamentos')||'[]');
  h.unshift(orcamento);
  localStorage.setItem('orcamentos', JSON.stringify(h));

  alert('Orçamento salvo!');
}

// ================== HISTÓRICO ==================
function mostrarHistorico(){
  const h = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  if (!listaHistorico || !modalHistorico) return;

  listaHistorico.innerHTML = '';

  if (!h.length){
    listaHistorico.innerHTML = '<li>Nenhum orçamento salvo.</li>';
    modalHistorico.style.display = 'block';
    return;
  }

  h.forEach((orc, i) => {
    const li = document.createElement('li');
    li.style.borderBottom = '1px solid #eee';
    li.style.padding = '8px 0';

    // ===== INFO =====
    const statusTexto = orc.status === 'pago' ? 'PAGO' : 'EM ABERTO';
    const statusCor = orc.status === 'pago' ? 'green' : 'orange';

    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${orc.cliente || 'Cliente'}</strong> – ${orc.aparelho || ''}<br>
      <small>${orc.data}</small><br>
      <small>Status: <strong style="color:${statusCor}">${statusTexto}</strong></small>
    `;
    info.style.cursor = 'pointer';
    info.onclick = () => {
      if (typeof carregarOrcamento === 'function') {
        carregarOrcamento(orc);
        preencherDadosEmpresa();
      }
    };

    // ===== AÇÕES =====
    const acoes = document.createElement('div');
    acoes.style.display = 'flex';
    acoes.style.gap = '6px';
    acoes.style.marginTop = '6px';
    acoes.style.flexWrap = 'wrap';

    // ➖ SAÍDA
    const b1 = document.createElement('button');
    b1.textContent = '➖ Saída';
    b1.onclick = e => {
      e.stopPropagation();
      lancarSaidaNoCaixa(orc);
      mostrarHistorico();
    };
    if (orc.saidaLancada) b1.disabled = true;

    // ➕ ENTRADA
    const b2 = document.createElement('button');
    b2.textContent = '➕ Entrada';
    b2.onclick = e => {
      e.stopPropagation();
      lancarEntradaNoCaixa(orc);
      mostrarHistorico();
    };
    if (orc.entradaLancada) b2.disabled = true;

    // 📄 PDF
  const btnPdf = document.createElement('button');
btnPdf.textContent = '📄 PDF';
btnPdf.onclick = e => {
  e.stopPropagation();

  if (typeof carregarOrcamento === 'function') {
    carregarOrcamento(orc);

    // força atualizar tabela + total
    recalcular();

    // garante logo + dados antes de imprimir
    preencherDadosEmpresa();

    // pequeno delay só pra renderizar
    setTimeout(() => {
      window.print();
    }, 400);
  }
};

    // 🗑️ EXCLUIR
    const bx = document.createElement('button');
    bx.textContent = '🗑️';
    bx.onclick = e => {
      e.stopPropagation();
      h.splice(i, 1);
      localStorage.setItem('orcamentos', JSON.stringify(h));
      mostrarHistorico();
    };

    // ORDEM DOS BOTÕES
    acoes.append(b1, b2, btnPdf, bx);

    li.append(info, acoes);
    listaHistorico.appendChild(li);
  });

  modalHistorico.style.display = 'block';
}
// ================== CAIXA ==================
function calcularTotalOrcamento(orc){
  let total = 0;

  if (orc.maoObraIncluida) total += Number(orc.valorMaoObra || 0);

  if (Array.isArray(orc.servicos)) {
    orc.servicos.forEach(s => {
      if (s.selecionado) total += Number(s.valor || 0);
    });
  }

  if (Array.isArray(orc.pecas)) {
    orc.pecas.forEach(p => {
      total += Number(p.valor || 0) * 1.25;
    });
  }

  return total;
}

function calcularTotalPecasSemLucro(orc){
  if (!Array.isArray(orc.pecas)) return 0;
  return orc.pecas.reduce((s,p)=>s+Number(p.valor||0),0);
}

function salvarNoCaixa(movimento){
  const caixa = JSON.parse(localStorage.getItem('livroCaixa') || '[]');
  caixa.unshift({
    id: Date.now(),
    ...movimento
  });
  localStorage.setItem('livroCaixa', JSON.stringify(caixa));
}

function atualizarOrcamento(orcAtualizado){
  const lista = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  const nova = lista.map(o =>
    o.id === orcAtualizado.id ? orcAtualizado : o
  );
  localStorage.setItem('orcamentos', JSON.stringify(nova));
}

function lancarSaidaNoCaixa(orc){
  if (orc.saidaLancada) {
    alert('Saída já lançada.');
    return;
  }

  const valor = calcularTotalPecasSemLucro(orc);
  if (!valor || valor <= 0) {
    alert('Este orçamento não possui peças.');
    return;
  }

  salvarNoCaixa({
    tipo: 'saida',
    descricao: `Compra de peças – ${orc.cliente || 'Cliente'}`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  orc.saidaLancada = true;
  atualizarOrcamento(orc);
  alert('Saída lançada no caixa.');
}

function lancarEntradaNoCaixa(orc){
  if (orc.entradaLancada) {
    alert('Entrada já lançada.');
    return;
  }

  const valor = calcularTotalOrcamento(orc);
  if (!valor || valor <= 0) {
    alert('Orçamento sem valor.');
    return;
  }

  salvarNoCaixa({
    tipo: 'entrada',
    descricao: `Pagamento – ${orc.cliente || 'Cliente'}`,
    valor,
    data: new Date().toLocaleString('pt-BR')
  });

  orc.entradaLancada = true;
  orc.status = 'pago';
  atualizarOrcamento(orc);
  alert('Entrada lançada no caixa.');
}
// ================== INIT ==================
document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  recalcular();
  preencherDadosEmpresa();
});

// ================== EXPOR FUNÇÕES PARA BOTÕES HTML ==================
window.recalcular = recalcular;
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;

window.fecharHistorico = function () {
  if (modalHistorico) modalHistorico.style.display = 'none';
};
// ================== EXPOR FUNÇÕES PARA USO NO HISTÓRICO ==================
window.lancarEntradaNoCaixa = lancarEntradaNoCaixa;
window.lancarSaidaNoCaixa = lancarSaidaNoCaixa;

if (typeof carregarOrcamento === 'function') {
  window.carregarOrcamento = carregarOrcamento;
}