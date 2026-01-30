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

  if (incluirMaoObra.checked) {
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
      if (nome === 'Outros' && outrosDesc.value.trim()) {
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
  custo.innerText = 'R$ ' + formatBR(total);

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

// ================== INIT ==================
document.addEventListener('DOMContentLoaded',()=>{
  renderizarServicos();
  recalcular();
  preencherDadosEmpresa();
});

// ================== GLOBAIS ==================
window.recalcular = recalcular;
window.salvarOrcamento = salvarOrcamento;
window.mostrarHistorico = mostrarHistorico;
window.fecharHistorico = () => modalHistorico.style.display = 'none';