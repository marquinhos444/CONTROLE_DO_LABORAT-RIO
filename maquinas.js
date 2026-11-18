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
  const lista = DB.getAll(KEY).sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "")
  );

  const corpo = document.getElementById("corpoTabela");
  const vazio = document.getElementById("tabelaVazia");

  if (!corpo || !vazio) return;

  if (lista.length === 0) {
    corpo.innerHTML = "";
    vazio.style.display = "block";
    return;
  }

  vazio.style.display = "none";

  corpo.innerHTML = lista.map((m) => {
    const st = statusMaquina(m);
    const emUso = maquinaEstaEmUso(m.id);

    return `
      <tr>
        <td>${escapeHtml(m.nome || "-")}</td>
        <td>${escapeHtml(m.localizacao || "-")}</td>
        <td>${escapeHtml(m.patrimonio || "-")}</td>
        <td>
          <span class="badge ${escapeHtml(st.classe)}">
            ${escapeHtml(st.texto)}
          </span>
        </td>
        <td>
          <button
            class="btn btn-secondary btn-sm"
            data-editar="${escapeHtml(m.id)}">
            Editar
          </button>

          <button
            class="btn btn-danger btn-sm"
            data-excluir="${escapeHtml(m.id)}"
            ${emUso ? 'disabled title="Máquina em uso"' : ""}>
            Excluir
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function limparForm() {
  if (!form) return;

  form.reset();
  campoId.value = "";
  btnSalvar.textContent = "Cadastrar máquina";
  btnCancelar.style.display = "none";
  tituloForm.textContent = "Nova máquina";
}

function patrimonioDuplicado(patrimonio, idAtual) {
  if (!patrimonio) return false;

  return DB.getAll(KEY).some((m) =>
    m.id !== idAtual &&
    (m.patrimonio || "").trim().toLowerCase() === patrimonio.toLowerCase()
  );
}

if (form && campoId && campoNome && campoLocalizacao &&
    campoPatrimonio && campoStatus && btnSalvar &&
    btnCancelar && tituloForm) {

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = campoId.value;

    const dados = {
      nome: campoNome.value.trim(),
      localizacao: campoLocalizacao.value.trim(),
      patrimonio: campoPatrimonio.value.trim(),
      statusManual: campoStatus.value
    };

    if (!dados.nome) {
      mostrarToast("Informe o nome da máquina.", "erro");
      campoNome.focus();
      return;
    }

    if (patrimonioDuplicado(dados.patrimonio, id)) {
      mostrarToast("Este patrimônio já está cadastrado.", "erro");
      campoPatrimonio.focus();
      return;
    }

    if (!["disponivel", "manutencao"].includes(dados.statusManual)) {
      mostrarToast("Selecione um status válido.", "erro");
      return;
    }

    if (id && !DB.find(KEY, id)) {
      mostrarToast("Máquina não encontrada.", "erro");
      limparForm();
      renderizar();
      return;
    }

    if (id && dados.statusManual === "manutencao" &&
        maquinaEstaEmUso(id)) {
      mostrarToast(
        "Não é possível colocar em manutenção uma máquina em uso.",
        "erro"
      );
      return;
    }

    if (id) {
      DB.update(KEY, id, dados);
      mostrarToast("Máquina atualizada com sucesso!");
    } else {
      DB.add(KEY, dados);
      mostrarToast("Máquina cadastrada com sucesso!");
    }

    limparForm();
    renderizar();
  });

  btnCancelar.addEventListener("click", limparForm);
}

// Editar máquina
function editar(id) {
  const m = DB.find(KEY, id);

  if (!m) {
    mostrarToast("Máquina não encontrada.", "erro");
    renderizar();
    return;
  }

  campoId.value = m.id;
  campoNome.value = m.nome || "";
  campoLocalizacao.value = m.localizacao || "";
  campoPatrimonio.value = m.patrimonio || "";
  campoStatus.value = m.statusManual || "disponivel";

  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.style.display = "inline-flex";
  tituloForm.textContent = "Editando máquina";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluir(id) {
  if (!DB.find(KEY, id)) {
    mostrarToast("Máquina não encontrada.", "erro");
    renderizar();
    return;
  }

  if (maquinaEstaEmUso(id)) {
    mostrarToast(
      "Não é possível excluir: máquina em uso.",
      "erro"
    );
    return;
  }

  const possuiHistorico = DB.getAll(DB.KEYS.acessos)
    .some((a) => a.maquinaId === id);

  if (possuiHistorico) {
    mostrarToast(
      "Não é possível excluir: esta máquina possui histórico de acessos.",
      "erro"
    );
    return;
  }

  if (!confirm("Deseja realmente excluir esta máquina?")) {
    return;
  }

  DB.remove(KEY, id);
  mostrarToast("Máquina removida.", "erro");
  renderizar();
}

const corpoTabela = document.getElementById("corpoTabela");

if (corpoTabela) {
  corpoTabela.addEventListener("click", (e) => {
    const botaoEditar = e.target.closest("[data-editar]");
    const botaoExcluir = e.target.closest("[data-excluir]");

    if (botaoEditar) {
      editar(botaoEditar.dataset.editar);
    }

    if (botaoExcluir && !botaoExcluir.disabled) {
      excluir(botaoExcluir.dataset.excluir);
    }
  });
}

document.addEventListener("DOMContentLoaded", renderizar);
