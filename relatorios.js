const form = document.getElementById("formFiltro");
const filtroDataIni = document.getElementById("filtroDataIni");
const filtroDataFim = document.getElementById("filtroDataFim");
const filtroAluno = document.getElementById("filtroAluno");
const filtroTurma = document.getElementById("filtroTurma");
const filtroMaquina = document.getElementById("filtroMaquina");
const filtroStatus = document.getElementById("filtroStatus");

let ultimoResultado = [];

function carregarFiltros() {
  const usuarios = DB.getAll(DB.KEYS.usuarios).sort((a, b) => a.nome.localeCompare(b.nome));
  const maquinas = DB.getAll(DB.KEYS.maquinas).sort((a, b) => a.nome.localeCompare(b.nome));
  const turmas = [...new Set(usuarios.map((u) => u.turma))].sort();

  filtroAluno.innerHTML =
    '<option value="">Todos</option>' +
    usuarios.map((u) => `<option value="${u.id}">${escapeHtml(u.nome)}</option>`).join("");

  filtroTurma.innerHTML =
    '<option value="">Todas</option>' +
    turmas.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");

  filtroMaquina.innerHTML =
    '<option value="">Todas</option>' +
    maquinas.map((m) => `<option value="${m.id}">${escapeHtml(m.nome)}</option>`).join("");
}

function obterResultado() {
  const acessos = DB.getAll(DB.KEYS.acessos);
  const usuarios = DB.getAll(DB.KEYS.usuarios);
  const maquinas = DB.getAll(DB.KEYS.maquinas);

  return acessos
    .map((a) => ({
      ...a,
      aluno: usuarios.find((u) => u.id === a.alunoId) || null,
      maquina: maquinas.find((m) => m.id === a.maquinaId) || null,
    }))
    .filter((a) => {
      if (filtroDataIni.value && a.data < filtroDataIni.value) return false;
      if (filtroDataFim.value && a.data > filtroDataFim.value) return false;
      if (filtroAluno.value && a.alunoId !== filtroAluno.value) return false;
      if (filtroTurma.value && (!a.aluno || a.aluno.turma !== filtroTurma.value)) return false;
      if (filtroMaquina.value && a.maquinaId !== filtroMaquina.value) return false;
      if (filtroStatus.value && a.status !== filtroStatus.value) return false;
      return true;
    })
    .sort((a, b) => (a.data + a.horaEntrada < b.data + b.horaEntrada ? 1 : -1));
}

function renderizarResultado() {
  const resultado = obterResultado();
  ultimoResultado = resultado;

  document.getElementById("resTotal").textContent = resultado.length;
  document.getElementById("resAtivos").textContent = resultado.filter((a) => a.status === "ativo").length;

  const encerrados = resultado.filter((a) => a.status === "encerrado");
  if (encerrados.length > 0) {
    const totalMin = encerrados.reduce((soma, a) => {
      const d = calcularDuracao(a.horaEntrada, a.horaSaida);
      return soma + (d ? d.minutos : 0);
    }, 0);
    const media = Math.round(totalMin / encerrados.length);
    document.getElementById("resTempoMedio").textContent = `${Math.floor(media / 60)}h ${String(media % 60).padStart(2, "0")}min`;
  } else {
    document.getElementById("resTempoMedio").textContent = "0h 00min";
  }

  const corpo = document.getElementById("corpoRelatorio");
  const vazio = document.getElementById("vazioRelatorio");

  if (resultado.length === 0) {
    corpo.innerHTML = "";
    vazio.style.display = "block";
    return;
  }
  vazio.style.display = "none";

  corpo.innerHTML = resultado
    .map((a) => {
      const duracao = a.status === "encerrado" ? calcularDuracao(a.horaEntrada, a.horaSaida) : calcularDuracao(a.horaEntrada, horaAgora());
      const badge = a.status === "ativo" ? '<span class="badge badge-verde">Ativo</span>' : '<span class="badge badge-cinza">Encerrado</span>';
      return `
        <tr>
          <td>${escapeHtml(a.aluno ? a.aluno.nome : "Aluno removido")}</td>
          <td>${escapeHtml(a.aluno ? a.aluno.turma : "-")}</td>
          <td>${escapeHtml(a.maquina ? a.maquina.nome : "Máquina removida")}</td>
          <td>${formatarDataBR(a.data)}</td>
          <td>${a.horaEntrada}</td>
          <td>${a.horaSaida || "-"}</td>
          <td>${duracao ? duracao.texto : "-"}</td>
          <td>${badge}</td>
        </tr>`;
    })
    .join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  renderizarResultado();
});

document.getElementById("btnLimparFiltros").addEventListener("click", () => {
  form.reset();
  renderizarResultado();
});

document.getElementById("btnExportar").addEventListener("click", () => {
  if (ultimoResultado.length === 0) {
    mostrarToast("Não há dados para exportar.", "erro");
    return;
  }

  const cabecalho = ["Aluno", "E-mail", "Turma", "Máquina", "Data", "Entrada", "Saída", "Duração", "Status"];
  const linhas = ultimoResultado.map((a) => {
    const duracao = a.status === "encerrado" ? calcularDuracao(a.horaEntrada, a.horaSaida) : calcularDuracao(a.horaEntrada, horaAgora());
    return [
      a.aluno ? a.aluno.nome : "Aluno removido",
      a.aluno ? a.aluno.email : "-",
      a.aluno ? a.aluno.turma : "-",
      a.maquina ? a.maquina.nome : "Máquina removida",
      formatarDataBR(a.data),
      a.horaEntrada,
      a.horaSaida || "-",
      duracao ? duracao.texto : "-",
      a.status === "ativo" ? "Ativo" : "Encerrado",
    ];
  });

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\n");


  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio_acessos_${hojeISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  mostrarToast("Relatório exportado!");
});

document.addEventListener("DOMContentLoaded", () => {
  carregarFiltros();
  renderizarResultado();
});