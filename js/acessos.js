const KEY = DB.KEYS.acessos;

const form = document.getElementById("formAcesso");
const selectAluno = document.getElementById("selectAluno");
const selectMaquina = document.getElementById("selectMaquina");
const inputData = document.getElementById("inputData");
const inputHora = document.getElementById("inputHora");

function carregarSelects() {
  const usuarios = DB.getAll(DB.KEYS.usuarios).sort((a, b) => a.nome.localeCompare(b.nome));
  const maquinas = DB.getAll(DB.KEYS.maquinas).sort((a, b) => a.nome.localeCompare(b.nome));

  selectAluno.innerHTML =
    '<option value="">Selecione o aluno</option>' +
    usuarios
      .map((u) => `<option value="${u.id}">${escapeHtml(u.nome)} (${escapeHtml(u.turma)})</option>`)
      .join("");

  selectMaquina.innerHTML =
    '<option value="">Selecione a máquina</option>' +
    maquinas
      .map((m) => {
        const emUso = maquinaEstaEmUso(m.id);
        const emManutencao = m.statusManual === "manutencao";
        const bloqueada = emUso || emManutencao;
        const sufixo = emUso ? " - em uso" : emManutencao ? " - manutenção" : "";
        return `<option value="${m.id}" ${bloqueada ? "disabled" : ""}>${escapeHtml(m.nome)}${sufixo}</option>`;
      })
      .join("");
}

function preencherPadroes() {
  inputData.value = hojeISO();
  inputHora.value = horaAgora();
}

function renderizarTabelas() {
  const acessos = DB.getAll(KEY);
  const usuarios = DB.getAll(DB.KEYS.usuarios);
  const maquinas = DB.getAll(DB.KEYS.maquinas);

  const ativos = acessos
    .filter((a) => a.status === "ativo")
    .sort((a, b) => (a.horaEntrada < b.horaEntrada ? 1 : -1));

  const corpoAtivos = document.getElementById("corpoAtivos");
  const vazioAtivos = document.getElementById("vazioAtivos");

  if (ativos.length === 0) {
    corpoAtivos.innerHTML = "";
    vazioAtivos.style.display = "block";
  } else {
    vazioAtivos.style.display = "none";
    corpoAtivos.innerHTML = ativos
      .map((a) => {
        const aluno = usuarios.find((u) => u.id === a.alunoId);
        const maquina = maquinas.find((m) => m.id === a.maquinaId);
        const decorrido = calcularDuracao(a.horaEntrada, horaAgora());
        return `
          <tr>
            <td>${escapeHtml(aluno ? aluno.nome : "Aluno removido")}</td>
            <td>${escapeHtml(aluno ? aluno.turma : "-")}</td>
            <td>${escapeHtml(maquina ? maquina.nome : "Máquina removida")}</td>
            <td>${formatarDataBR(a.data)}</td>
            <td>${a.horaEntrada}</td>
            <td><span class="badge badge-verde">${decorrido ? decorrido.texto : "-"}</span></td>
            <td><button class="btn btn-success btn-sm" onclick="encerrar('${a.id}')">Encerrar acesso</button></td>
          </tr>`;
      })
      .join("");
  }

  const historico = acessos
    .filter((a) => a.status === "encerrado")
    .sort((a, b) => b.criadoEm - a.criadoEm)
    .slice(0, 30);

  const corpoHistorico = document.getElementById("corpoHistorico");
  const vazioHistorico = document.getElementById("vazioHistorico");

  if (historico.length === 0) {
    corpoHistorico.innerHTML = "";
    vazioHistorico.style.display = "block";
  } else {
    vazioHistorico.style.display = "none";
    corpoHistorico.innerHTML = historico
      .map((a) => {
        const aluno = usuarios.find((u) => u.id === a.alunoId);
        const maquina = maquinas.find((m) => m.id === a.maquinaId);
        const duracao = calcularDuracao(a.horaEntrada, a.horaSaida);
        return `
          <tr>
            <td>${escapeHtml(aluno ? aluno.nome : "Aluno removido")}</td>
            <td>${escapeHtml(aluno ? aluno.turma : "-")}</td>
            <td>${escapeHtml(maquina ? maquina.nome : "Máquina removida")}</td>
            <td>${formatarDataBR(a.data)}</td>
            <td>${a.horaEntrada}</td>
            <td>${a.horaSaida}</td>
            <td><span class="badge badge-cinza">${duracao ? duracao.texto : "-"}</span></td>
          </tr>`;
      })
      .join("");
  }
}

function atualizarTudo() {
  carregarSelects();
  renderizarTabelas();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const alunoId = selectAluno.value;
  const maquinaId = selectMaquina.value;
  const data = inputData.value;
  const horaEntrada = inputHora.value;

  if (!alunoId || !maquinaId || !data || !horaEntrada) {
    mostrarToast("Preencha todos os campos.", "erro");
    return;
  }

  if (maquinaEstaEmUso(maquinaId)) {
    mostrarToast("Esta máquina já está em uso por outro aluno.", "erro");
    return;
  }

  if (alunoTemAcessoAtivo(alunoId)) {
    mostrarToast("Este aluno já possui um acesso ativo em outra máquina.", "erro");
    return;
  }

  DB.add(KEY, {
    alunoId,
    maquinaId,
    data,
    horaEntrada,
    horaSaida: null,
    status: "ativo",
  });

  mostrarToast("Acesso iniciado com sucesso!");
  form.reset();
  preencherPadroes();
  atualizarTudo();
});

function encerrar(id) {
  DB.update(KEY, id, { horaSaida: horaAgora(), status: "encerrado" });
  mostrarToast("Acesso encerrado.", "sucesso");
  atualizarTudo();
}

setInterval(() => {
  if (document.getElementById("corpoAtivos")) renderizarTabelas();
}, 30000);

document.addEventListener("DOMContentLoaded", () => {
  preencherPadroes();
  atualizarTudo();
});
