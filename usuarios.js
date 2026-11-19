const KEY = DB.KEYS.usuarios;

const form = document.getElementById("formUsuario");
const campoId = document.getElementById("usuarioId");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoTurma = document.getElementById("turma");
const campoBusca = document.getElementById("busca");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

function renderizar() {
  const termo = campoBusca.value.trim().toLowerCase();
  let lista = DB.getAll(KEY).sort((a, b) => a.nome.localeCompare(b.nome));

  if (termo) {
    lista = lista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.turma.toLowerCase().includes(termo)
    );
  }

  const corpo = document.getElementById("corpoTabela");
  const vazio = document.getElementById("tabelaVazia");

  if (lista.length === 0) {
    corpo.innerHTML = "";
    vazio.style.display = "block";
    vazio.textContent = termo
      ? "Nenhum usuário encontrado para essa busca."
      : "Nenhum usuário cadastrado ainda.";
    return;
  }
  vazio.style.display = "none";

  corpo.innerHTML = lista
    .map(
      (u) => `
        <tr>
          <td>${escapeHtml(u.nome)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge badge-azul">${escapeHtml(u.turma)}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="editar('${u.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="excluir('${u.id}')">Excluir</button>
          </td>
        </tr>`
    )
    .join("");
}

function limparForm() {
  form.reset();
  campoId.value = "";
  btnSalvar.textContent = "Cadastrar usuário";
  btnCancelar.style.display = "none";
  tituloForm.textContent = "Novo usuário";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validarEmail(campoEmail.value.trim())) {
    mostrarToast("Informe um e-mail institucional válido.", "erro");
    return;
  }

  const dados = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    turma: campoTurma.value.trim(),
  };

  if (campoId.value) {
    DB.update(KEY, campoId.value, dados);
    mostrarToast("Usuário atualizado com sucesso!");
  } else {
    DB.add(KEY, dados);
    mostrarToast("Usuário cadastrado com sucesso!");
  }

  limparForm();
  renderizar();
});

btnCancelar.addEventListener("click", limparForm);
campoBusca.addEventListener("input", renderizar);

function editar(id) {
  const u = DB.find(KEY, id);
  if (!u) return;
  campoId.value = u.id;
  campoNome.value = u.nome;
  campoEmail.value = u.email;
  campoTurma.value = u.turma;
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.style.display = "inline-flex";
  tituloForm.textContent = "Editando usuário";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluir(id) {
  if (!confirm("Deseja realmente excluir este usuário?")) return;
  DB.remove(KEY, id);
  mostrarToast("Usuário removido.", "erro");
  renderizar();
}

document.addEventListener("DOMContentLoaded", renderizar);