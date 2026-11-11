// Carregar dados armazenados ou iniciar com exemplos
let estoque = JSON.parse(localStorage.getItem('stock_produtos')) || [
  { id: 1, nome: "Notebook Pro M4", preco: 7500.00, quantidade: 4 },
  { id: 2, nome: "Mouse Gamer Sem Fio", preco: 180.00, quantidade: 15 },
  { id: 3, nome: "Monitor Ultrawide 29", preco: 1200.00, quantidade: 2 }
];

let vendas = JSON.parse(localStorage.getItem('stock_vendas')) || [];

// Elementos DOM
const formProduto = document.getElementById('form-produto');
const formVenda = document.getElementById('form-venda');
const selectProduto = document.getElementById('select-produto');
const qtdVendaInput = document.getElementById('qtd-venda');
const prevTotal = document.getElementById('prev-total');
const tbodyEstoque = document.getElementById('tbody-estoque');
const tbodyHistorico = document.getElementById('tbody-historico');
const totalProdutosEl = document.getElementById('total-produtos');
const faturamentoTotalEl = document.getElementById('faturamento-total');
const totalVendasEl = document.getElementById('total-vendas');
const buscaInput = document.getElementById('busca-produto');

// Formatação Monetária
const formataReal = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Salvar no LocalStorage
function persistirDados() {
  localStorage.setItem('stock_produtos', JSON.stringify(estoque));
  localStorage.setItem('stock_vendas', JSON.stringify(vendas));
}

// Atualizar Interface
function renderizarTudo() {
  renderizarEstoque();
  renderizarSelectVenda();
  renderizarHistorico();
  atualizarDashboard();
}

function renderizarEstoque(filtro = '') {
  tbodyEstoque.innerHTML = '';
  
  const filtrados = estoque.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()));

  if (filtrados.length === 0) {
    tbodyEstoque.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Nenhum produto cadastrado</td></tr>`;
    return;
  }

  filtrados.forEach(produto => {
    const tr = document.createElement('tr');
    const statusTag = produto.quantidade <= 3 
      ? `<span class="tag tag-low">Estoque Baixo (${produto.quantidade})</span>`
      : `<span class="tag tag-ok">Disponível</span>`;

    tr.innerHTML = `
      <td><strong>${produto.nome}</strong></td>
      <td>${formataReal(produto.preco)}</td>
      <td>${produto.quantidade} un</td>
      <td>${statusTag}</td>
      <td>
        <button class="btn btn-danger" onclick="removerProduto(${produto.id})">Excluir</button>
      </td>
    `;
    tbodyEstoque.appendChild(tr);
  });
}

function renderizarSelectVenda() {
  selectProduto.innerHTML = '<option value="" disabled selected>Selecione um item</option>';
  estoque.filter(p => p.quantidade > 0).forEach(produto => {
    const opt = document.createElement('option');
    opt.value = produto.id;
    opt.textContent = `${produto.nome} - (${produto.quantidade} em estoque)`;
    selectProduto.appendChild(opt);
  });
  atualizarPrevTotal();
}

function renderizarHistorico() {
  tbodyHistorico.innerHTML = '';
  if (vendas.length === 0) {
    tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">Nenhuma venda registrada</td></tr>`;
    return;
  }

  vendas.slice().reverse().forEach(venda => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${venda.data}</td>
      <td>${venda.nomeProduto}</td>
      <td>${venda.quantidade}</td>
      <td><strong>${formataReal(venda.valorTotal)}</strong></td>
    `;
    tbodyHistorico.appendChild(tr);
  });
}

function atualizarDashboard() {
  const totalItens = estoque.reduce((acc, p) => acc + p.quantidade, 0);
  const faturamento = vendas.reduce((acc, v) => acc + v.valorTotal, 0);

  totalProdutosEl.textContent = `${totalItens} itens`;
  faturamentoTotalEl.textContent = formataReal(faturamento);
  totalVendasEl.textContent = `${vendas.length} vendas`;
}

function atualizarPrevTotal() {
  const produtoId = Number(selectProduto.value);
  const qtd = Number(qtdVendaInput.value) || 0;
  const produto = estoque.find(p => p.id === produtoId);

  if (produto && qtd > 0) {
    prevTotal.textContent = formataReal(produto.preco * qtd);
  } else {
    prevTotal.textContent = 'R$ 0,00';
  }
}

// Ações do Sistema
formProduto.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const preco = parseFloat(document.getElementById('preco').value);
  const quantidade = parseInt(document.getElementById('quantidade').value);

  const novoProduto = {
    id: Date.now(),
    nome,
    preco,
    quantidade
  };

  estoque.push(novoProduto);
  persistirDados();
  renderizarTudo();
  formProduto.reset();
});

selectProduto.addEventListener('change', atualizarPrevTotal);
qtdVendaInput.addEventListener('input', atualizarPrevTotal);

formVenda.addEventListener('submit', (e) => {
  e.preventDefault();
  const produtoId = Number(selectProduto.value);
  const quantidade = Number(qtdVendaInput.value);
  const produto = estoque.find(p => p.id === produtoId);

  if (!produto) return;

  if (quantidade > produto.quantidade) {
    alert(`Quantidade indisponível! Estoque atual: ${produto.quantidade}`);
    return;
  }

  // Baixa no estoque
  produto.quantidade -= quantidade;

  // Registrar venda
  const novaVenda = {
    id: Date.now(),
    nomeProduto: produto.nome,
    quantidade,
    valorTotal: produto.preco * quantidade,
    data: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };

  vendas.push(novaVenda);
  persistirDados();
  renderizarTudo();
  formVenda.reset();
  prevTotal.textContent = 'R$ 0,00';
});

window.removerProduto = function(id) {
  if (confirm('Tem certeza que deseja excluir este produto do estoque?')) {
    estoque = estoque.filter(p => p.id !== id);
    persistirDados();
    renderizarTudo();
  }
};

buscaInput.addEventListener('input', (e) => {
  renderizarEstoque(e.target.value);
});

// Inicialização
renderizarTudo();
