// =============================================
// NexoCorp – Sistema de Cadastro | app.js
// =============================================

// ─── Navigation ─────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('page-title');
const breadcrumbSub = document.getElementById('breadcrumb-sub');

const titles = {
  pessoas:   'Cadastro de Colaboradores',
  produtos:  'Cadastro de Produtos',
  registros: 'Registros Cadastrados',
};

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.section;

    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${target}`).classList.add('active');

    pageTitle.textContent = titles[target];
    breadcrumbSub.textContent = item.textContent.trim();
  });
});

// ─── Tabs ────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const parent = tab.closest('.card-form');
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ─── Data Store ─────────────────────────────
const db = { pessoas: [], produtos: [] };

// ─── Toast ──────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  toast.style.borderLeftColor = type === 'success' ? 'var(--green)' : 'var(--red)';
  toastIcon.style.color       = type === 'success' ? 'var(--green)' : 'var(--red)';
  toastIcon.textContent       = type === 'success' ? '✓' : '✕';
  toastMsg.textContent = msg;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── Validation ─────────────────────────────
function validate(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    }
  });
  return valid;
}

// ─── Clear Form ─────────────────────────────
function limparForm(formId) {
  const form = document.getElementById(formId);
  form.reset();
  form.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
}

// ─── CPF Mask ───────────────────────────────
document.getElementById('p-cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  this.value = v;
});

// ─── Phone Mask ─────────────────────────────
document.getElementById('p-telefone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  else if (v.length > 0) v = v.replace(/(\d{0,2})/, '($1');
  this.value = v;
});

// ─── Update Badge ────────────────────────────
function updateBadge() {
  const total = db.pessoas.length + db.produtos.length;
  document.getElementById('badge-total').textContent =
    `${total} registro${total !== 1 ? 's' : ''}`;
}

// ─── Render Tables ──────────────────────────
function renderPessoas() {
  const wrapper = document.getElementById('table-pessoas-wrapper');
  if (!db.pessoas.length) {
    wrapper.className = 'empty-state';
    wrapper.innerHTML = `
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>Nenhum colaborador cadastrado ainda.</p>`;
    return;
  }
  wrapper.className = '';
  wrapper.innerHTML = `
    <table>
      <thead><tr>
        <th>#</th><th>Nome</th><th>CPF</th><th>Cargo</th><th>Departamento</th><th>E-mail</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${db.pessoas.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.cpf || '—'}</td>
            <td>${p.cargo}</td>
            <td>${p.departamento}</td>
            <td>${p.email}</td>
            <td><span class="status-pill status-ok">Ativo</span></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderProdutos() {
  const wrapper = document.getElementById('table-produtos-wrapper');
  if (!db.produtos.length) {
    wrapper.className = 'empty-state';
    wrapper.innerHTML = `
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>Nenhum produto cadastrado ainda.</p>`;
    return;
  }
  wrapper.className = '';
  wrapper.innerHTML = `
    <table>
      <thead><tr>
        <th>#</th><th>Produto</th><th>SKU</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${db.produtos.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.codigo}</td>
            <td>${p.categoria}</td>
            <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
            <td>${p.estoque} ${p.unidade}</td>
            <td><span class="status-pill status-ok">Ativo</span></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ─── Form Submit: Pessoas ────────────────────
document.getElementById('form-pessoas').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validate(this)) {
    showToast('Preencha todos os campos obrigatórios!', 'error');
    return;
  }

  const entry = {
    nome:         document.getElementById('p-nome').value.trim(),
    cpf:          document.getElementById('p-cpf').value.trim(),
    data_nasc:    document.getElementById('p-data-nasc').value,
    email:        document.getElementById('p-email').value.trim(),
    telefone:     document.getElementById('p-telefone').value.trim(),
    cargo:        document.getElementById('p-cargo').value,
    departamento: document.getElementById('p-departamento').value,
    salario:      document.getElementById('p-salario').value,
    admissao:     document.getElementById('p-admissao').value,
    endereco:     document.getElementById('p-endereco').value.trim(),
    status: 'Ativo',
  };

  db.pessoas.push(entry);
  renderPessoas();
  updateBadge();
  limparForm('form-pessoas');
  showToast(`Colaborador "${entry.nome}" cadastrado com sucesso!`);
});

// ─── Form Submit: Produtos ───────────────────
document.getElementById('form-produtos').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validate(this)) {
    showToast('Preencha todos os campos obrigatórios!', 'error');
    return;
  }

  const entry = {
    nome:        document.getElementById('pr-nome').value.trim(),
    codigo:      document.getElementById('pr-codigo').value.trim(),
    categoria:   document.getElementById('pr-categoria').value,
    preco:       document.getElementById('pr-preco').value,
    custo:       document.getElementById('pr-custo').value,
    estoque:     document.getElementById('pr-estoque').value,
    min_estoque: document.getElementById('pr-min-estoque').value,
    fornecedor:  document.getElementById('pr-fornecedor').value.trim(),
    unidade:     document.getElementById('pr-unidade').value,
    descricao:   document.getElementById('pr-descricao').value.trim(),
    status: 'Ativo',
  };

  db.produtos.push(entry);
  renderProdutos();
  updateBadge();
  limparForm('form-produtos');
  showToast(`Produto "${entry.nome}" cadastrado com sucesso!`);
});
