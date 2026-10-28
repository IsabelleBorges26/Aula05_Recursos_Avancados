const API = 'http://localhost:3000';
let usuarioLogado = null;
let eventos = [];

const loginTela = document.getElementById('login-tela');
const homeTela = document.getElementById('home-tela');
const formularioArea = document.getElementById('formulario-area');

document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault();
  const erro = document.getElementById('erro-login');
  erro.textContent = '';

  try {
    const resposta = await fetch(`${API}/usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value
      })
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || 'Não foi possível entrar.');

    usuarioLogado = dados;
    loginTela.hidden = true;
    homeTela.hidden = false;
    document.getElementById('nome-usuario').textContent = dados.nome;
    await carregarEventos();
  } catch (erroLogin) {
    erro.textContent = erroLogin.message || 'Não foi possível conectar à API.';
  }
});

document.getElementById('sair').addEventListener('click', () => {
  usuarioLogado = null;
  homeTela.hidden = true;
  loginTela.hidden = false;
  document.getElementById('form-login').reset();
  fecharFormulario();
});

document.getElementById('novo-evento').addEventListener('click', () => {
  document.getElementById('form-evento').reset();
  document.getElementById('evento-id').value = '';
  document.getElementById('titulo-form').textContent = 'Novo evento';
  document.getElementById('erro-form').textContent = '';
  formularioArea.hidden = false;
  formularioArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('cancelar').addEventListener('click', fecharFormulario);
document.getElementById('atualizar').addEventListener('click', carregarEventos);

function fecharFormulario() {
  formularioArea.hidden = true;
  document.getElementById('form-evento').reset();
  document.getElementById('evento-id').value = '';
}

async function carregarEventos() {
  try {
    const resposta = await fetch(`${API}/evento`);
    if (!resposta.ok) throw new Error('Não foi possível carregar os eventos.');
    eventos = await resposta.json();
    mostrarEventos();
  } catch (erro) {
    alert('Não consegui carregar os eventos. Confira se a API está funcionando.');
  }
}

function mostrarEventos() {
  const lista = document.getElementById('lista-eventos');
  lista.innerHTML = '';
  document.getElementById('total-eventos').textContent = eventos.length;
  document.getElementById('total-tipos').textContent = new Set(eventos.map(e => e.tipoEvento)).size;
  document.getElementById('mensagem-vazia').hidden = eventos.length > 0;

  eventos.forEach(evento => {
    const linha = document.createElement('tr');
    const temperatura = evento.temperaturaMaxima == null ? '—' : `${evento.temperaturaMaxima} °C`;
    const data = new Date(evento.data).toLocaleDateString('pt-BR');
    linha.innerHTML = `
      <td><strong>${escapar(evento.cidade)}</strong></td>
      <td><span class="tag">${escapar(evento.tipoEvento)}</span></td>
      <td>${temperatura}</td>
      <td>${data}</td>
      <td>${escapar(evento.nivelImpacto)}</td>
      <td><div class="acoes-tabela"><button data-editar="${evento.id}">Editar</button><button class="btn-excluir" data-excluir="${evento.id}">Excluir</button></div></td>`;
    lista.appendChild(linha);
  });

  lista.querySelectorAll('[data-editar]').forEach(botao => {
    botao.addEventListener('click', () => editarEvento(Number(botao.dataset.editar)));
  });
  lista.querySelectorAll('[data-excluir]').forEach(botao => {
    botao.addEventListener('click', () => excluirEvento(Number(botao.dataset.excluir)));
  });
}

function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caractere]);
}

function editarEvento(id) {
  const evento = eventos.find(item => item.id === id);
  if (!evento) return;
  document.getElementById('evento-id').value = evento.id;
  document.getElementById('cidade').value = evento.cidade;
  document.getElementById('tipo').value = evento.tipoEvento;
  document.getElementById('temperatura').value = evento.temperaturaMaxima ?? '';
  document.getElementById('data').value = new Date(evento.data).toISOString().slice(0, 10);
  document.getElementById('impacto').value = evento.nivelImpacto;
  document.getElementById('titulo-form').textContent = 'Editar evento';
  document.getElementById('erro-form').textContent = '';
  formularioArea.hidden = false;
  formularioArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('form-evento').addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.getElementById('evento-id').value;
  const dados = {
    usuarioId: usuarioLogado.id,
    cidade: document.getElementById('cidade').value.trim(),
    tipoEvento: document.getElementById('tipo').value,
    temperaturaMaxima: document.getElementById('temperatura').value,
    data: document.getElementById('data').value || undefined,
    nivelImpacto: document.getElementById('impacto').value.trim()
  };

  try {
    const resposta = await fetch(id ? `${API}/evento/${id}` : `${API}/evento`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const retorno = await resposta.json();
    if (!resposta.ok) throw new Error(retorno.mensagem || 'Não foi possível salvar.');
    fecharFormulario();
    await carregarEventos();
  } catch (erro) {
    document.getElementById('erro-form').textContent = erro.message || 'Erro ao salvar evento.';
  }
});

async function excluirEvento(id) {
  if (!confirm('Deseja realmente excluir este evento?')) return;
  try {
    const resposta = await fetch(`${API}/evento/${id}`, { method: 'DELETE' });
    if (!resposta.ok) throw new Error();
    await carregarEventos();
  } catch (erro) {
    alert('Não foi possível excluir o evento.');
  }
}
