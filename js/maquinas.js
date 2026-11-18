const KEY = DB.KEYS.maquinas;

const form = document.getElementById("formMaquina");
const campoId = document.getElementById("maquinaId");
const campoNome = document.getElementById("nome");
const campoLocalizacao = document.getElementById("localizacao");
const campoPatrimonio = document.getElementById("patrimonio");
const campoStatus = document.getElementById("statusManual");
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
    .map((m) => {
      const st = statusMaquina(m);
      const emUso = maquinaEstaEmUso(m.id);
      return `
        <tr>
          <td>${escapeHtml(m.nome)}</td>
          <td>${escapeHtml(m.localizacao || "-")}</td>
          <td>${escapeHtml(m.patrimonio || "-")}</td>
          <td><span class="badge ${st.classe}">${st.texto}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="editar('${m.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="excluir('${m.id}')" ${emUso ? "disabled title=\"Máquina em uso\"" : ""}>Excluir</button>
          </td>
        </tr>`;
    })
    .join("");
}

function limparForm() {
  form.reset();
  campoId.value = "";
  btnSalvar.textContent = "Cadastrar máquina";
  btnCancelar.style.display = "none";
  tituloForm.textContent = "Nova máquina";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const dados = {
    nome: campoNome.value.trim(),
    localizacao: campoLocalizacao.value.trim(),
    patrimonio: campoPatrimonio.value.trim(),
    statusManual: campoStatus.value,
  };

  if (campoId.value) {
    DB.update(KEY, campoId.value, dados);
    mostrarToast("Máquina atualizada com sucesso!");
  } else {
    DB.add(KEY, dados);
    mostrarToast("Máquina cadastrada com sucesso!");
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
  campoLocalizacao.value = m.localizacao || "";
  campoPatrimonio.value = m.patrimonio || "";
  campoStatus.value = m.statusManual || "disponivel";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.style.display = "inline-flex";
  tituloForm.textContent = "Editando máquina";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluir(id) {
  if (maquinaEstaEmUso(id)) {
    mostrarToast("Não é possível excluir: máquina em uso.", "erro");
    return;
  }
  if (!confirm("Deseja realmente excluir esta máquina?")) return;
  DB.remove(KEY, id);
  mostrarToast("Máquina removida.", "erro");
  renderizar();
}

document.addEventListener("DOMContentLoaded", renderizar);
