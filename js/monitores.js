const KEY = DB.KEYS.monitores;

const form = document.getElementById("formMonitor");
const campoId = document.getElementById("monitorId");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoTurno = document.getElementById("turno");
const campoMatricula = document.getElementById("matricula");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

function renderizar() {
  const lista = DB.getAll(KEY).sort((a, b) => a.nome.localeCompare(b.nome));
  const corpo = document.getElementById("corpoTabela");
  const vazio = document.getElementById("tabelaVazia");

  if (lista.length === 0) {
    corpo.innerHTML = "";
    vazio.style.display = "block";
    return;
  }
  vazio.style.display = "none";

  corpo.innerHTML = lista
    .map(
      (m) => `
        <tr>
          <td>${escapeHtml(m.nome)}</td>
          <td>${escapeHtml(m.email)}</td>
          <td><span class="badge badge-azul">${escapeHtml(m.turno)}</span></td>
          <td>${escapeHtml(m.matricula || "-")}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="editar('${m.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="excluir('${m.id}')">Excluir</button>
          </td>
        </tr>`
    )
    .join("");
}

function limparForm() {
  form.reset();
  campoId.value = "";
  btnSalvar.textContent = "Cadastrar monitor";
  btnCancelar.style.display = "none";
  tituloForm.textContent = "Novo Monitor";
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
    turno: campoTurno.value,
    matricula: campoMatricula.value.trim(),
  };

  if (campoId.value) {
    DB.update(KEY, campoId.value, dados);
    mostrarToast("Monitor atualizado com sucesso!");
  } else {
    DB.add(KEY, dados);
    mostrarToast("Monitor cadastrado com sucesso!");
  }

  limparForm();
  renderizar();
});

btnCancelar.addEventListener("click", limparForm);

function editar(id) {
  const m = DB.find(KEY, id);
  if (!m) return;
  campoId.value = m.id;
  campoNome.value = m.nome;
  campoEmail.value = m.email;
  campoTurno.value = m.turno;
  campoMatricula.value = m.matricula || "";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.style.display = "inline-flex";
  tituloForm.textContent = "Editando monitor";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluir(id) {
  if (!confirm("Deseja realmente excluir este monitor?")) return;
  DB.remove(KEY, id);
  mostrarToast("Monitor removido.", "erro");
  renderizar();
}

document.addEventListener("DOMContentLoaded", renderizar);
