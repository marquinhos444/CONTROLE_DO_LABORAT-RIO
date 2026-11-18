
const KEY = DB.KEYS.acessos;

const form = document.getElementById("formAcesso");
const selectAluno = document.getElementById("selectAluno");
const selectMaquina = document.getElementById("selectMaquina");
const inputData = document.getElementById("inputData");
const inputHora = document.getElementById("inputHora");

const corpoAtivos = document.getElementById("corpoAtivos");
const vazioAtivos = document.getElementById("vazioAtivos");
const corpoHistorico = document.getElementById("corpoHistorico");
const vazioHistorico = document.getElementById("vazioHistorico");


if (form && selectAluno && selectMaquina && inputData && inputHora) {


  function obterDataHoraAtual() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");

    return {
      data: `${ano}-${mes}-${dia}`,
      hora: `${hora}:${minuto}`
    };
  }

  function converterDataHora(data, hora) {
    if (!data || !hora) return null;

    const resultado = new Date(`${data}T${hora}:00`);

    if (Number.isNaN(resultado.getTime())) {
      return null;
    }

    return resultado;
  }

  function calcularDuracaoAcesso(dataEntrada, horaEntrada, dataSaida, horaSaida) {
    const inicio = converterDataHora(dataEntrada, horaEntrada);
    const fim = converterDataHora(dataSaida, horaSaida);

    if (!inicio || !fim || fim < inicio) {
      return null;
    }

    const minutos = Math.floor(
      (fim.getTime() - inicio.getTime()) / 60000
    );

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return {
      horas,
      minutos: minutosRestantes,
      texto: `${horas}h ${String(minutosRestantes).padStart(2, "0")}min`
    };
  }

  function preencherPadroes() {
    const agora = obterDataHoraAtual();

    inputData.value = agora.data;
    inputHora.value = agora.hora;
  }

  function carregarSelects() {
    const usuarios = DB.getAll(DB.KEYS.usuarios)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const maquinas = DB.getAll(DB.KEYS.maquinas)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    selectAluno.innerHTML =
      '<option value="">Selecione o aluno</option>' +
      usuarios.map((u) => `
        <option value="${escapeHtml(u.id)}">
          ${escapeHtml(u.nome)} (${escapeHtml(u.turma || "-")})
        </option>
      `).join("");

    selectMaquina.innerHTML =
      '<option value="">Selecione a máquina</option>' +
      maquinas.map((m) => {
        const emUso = maquinaEstaEmUso(m.id);
        const emManutencao = m.statusManual === "manutencao";

        const bloqueada = emUso || emManutencao;

        const sufixo = emUso
          ? " - em uso"
          : emManutencao
            ? " - manutenção"
            : "";

        return `
          <option
            value="${escapeHtml(m.id)}"
            ${bloqueada ? "disabled" : ""}
          >
            ${escapeHtml(m.nome)}${sufixo}
          </option>
        `;
      }).join("");
  }

  function renderizarTabelas() {
    const acessos = DB.getAll(KEY);
    const usuarios = DB.getAll(DB.KEYS.usuarios);
    const maquinas = DB.getAll(DB.KEYS.maquinas);

    const agora = obterDataHoraAtual();

    const ativos = acessos
      .filter((a) => a.status === "ativo")
      .sort((a, b) => {
        const dataA = `${a.data}T${a.horaEntrada}`;
        const dataB = `${b.data}T${b.horaEntrada}`;

        return dataB.localeCompare(dataA);
      });

    if (corpoAtivos && vazioAtivos) {
      if (ativos.length === 0) {
        corpoAtivos.innerHTML = "";
        vazioAtivos.style.display = "block";
      } else {
        vazioAtivos.style.display = "none";

        corpoAtivos.innerHTML = ativos.map((a) => {
          const aluno = usuarios.find((u) => u.id === a.alunoId);
          const maquina = maquinas.find((m) => m.id === a.maquinaId);

          const decorrido = calcularDuracaoAcesso(
            a.data,
            a.horaEntrada,
            agora.data,
            agora.hora
          );

          return `
            <tr>
              <td>
                ${escapeHtml(aluno ? aluno.nome : "Aluno removido")}
              </td>

              <td>
                ${escapeHtml(aluno ? aluno.turma || "-" : "-")}
              </td>

              <td>
                ${escapeHtml(maquina ? maquina.nome : "Máquina removida")}
              </td>

              <td>
                ${escapeHtml(formatarDataBR(a.data))}
              </td>

              <td>
                ${escapeHtml(a.horaEntrada)}
              </td>

              <td>
                <span class="badge badge-verde">
                  ${decorrido ? decorrido.texto : "-"}
                </span>
              </td>

              <td>
                <button
                  class="btn btn-success btn-sm"
                  type="button"
                  data-encerrar="${escapeHtml(a.id)}"
                >
                  Encerrar acesso
                </button>
              </td>
            </tr>
          `;
        }).join("");
      }
    }

    const historico = acessos
      .filter((a) => a.status === "encerrado")
      .sort((a, b) => {
        const dataA = a.dataSaida || a.data;
        const dataB = b.dataSaida || b.data;

        const horarioA = `${dataA}T${a.horaSaida || "00:00"}`;
        const horarioB = `${dataB}T${b.horaSaida || "00:00"}`;

        return horarioB.localeCompare(horarioA);
      })
      .slice(0, 30);

    if (corpoHistorico && vazioHistorico) {
      if (historico.length === 0) {
        corpoHistorico.innerHTML = "";
        vazioHistorico.style.display = "block";
      } else {
        vazioHistorico.style.display = "none";

        corpoHistorico.innerHTML = historico.map((a) => {
          const aluno = usuarios.find((u) => u.id === a.alunoId);
          const maquina = maquinas.find((m) => m.id === a.maquinaId);

          const dataSaida = a.dataSaida || a.data;

          const duracao = calcularDuracaoAcesso(
            a.data,
            a.horaEntrada,
            dataSaida,
            a.horaSaida
          );

          return `
            <tr>
              <td>
                ${escapeHtml(aluno ? aluno.nome : "Aluno removido")}
              </td>

              <td>
                ${escapeHtml(aluno ? aluno.turma || "-" : "-")}
              </td>

              <td>
                ${escapeHtml(maquina ? maquina.nome : "Máquina removida")}
              </td>

              <td>
                ${escapeHtml(formatarDataBR(a.data))}
              </td>

              <td>
                ${escapeHtml(a.horaEntrada)}
              </td>

              <td>
                ${escapeHtml(a.horaSaida || "-")}
                ${dataSaida !== a.data
                  ? ` (${escapeHtml(formatarDataBR(dataSaida))})`
                  : ""}
              </td>

              <td>
                <span class="badge badge-cinza">
                  ${duracao ? duracao.texto : "-"}
                </span>
              </td>
            </tr>
          `;
        }).join("");
      }
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

    const usuarios = DB.getAll(DB.KEYS.usuarios);
    const maquinas = DB.getAll(DB.KEYS.maquinas);

    const alunoExiste = usuarios.some((u) => u.id === alunoId);
    const maquina = maquinas.find((m) => m.id === maquinaId);

    if (!alunoExiste) {
      mostrarToast("Aluno não encontrado. Atualize a página.", "erro");
      atualizarTudo();
      return;
    }

    if (!maquina) {
      mostrarToast("Máquina não encontrada. Atualize a página.", "erro");
      atualizarTudo();
      return;
    }

    const inicio = converterDataHora(data, horaEntrada);
    const agora = new Date();

    if (!inicio) {
      mostrarToast("Data ou horário inválido.", "erro");
      return;
    }

    if (inicio > agora) {
      mostrarToast("Não é permitido registrar um acesso futuro.", "erro");
      return;
    }

    if (maquina.statusManual === "manutencao") {
      mostrarToast("Esta máquina está em manutenção.", "erro");
      atualizarTudo();
      return;
    }

    if (maquinaEstaEmUso(maquinaId)) {
      mostrarToast("Esta máquina já está em uso por outro aluno.", "erro");
      atualizarTudo();
      return;
    }

    if (alunoTemAcessoAtivo(alunoId)) {
      mostrarToast(
        "Este aluno já possui um acesso ativo em outra máquina.",
        "erro"
      );
      atualizarTudo();
      return;
    }

    DB.add(KEY, {
      alunoId,
      maquinaId,
      data,
      horaEntrada,
      horaSaida: null,
      dataSaida: null,
      status: "ativo"
    });

    mostrarToast("Acesso iniciado com sucesso!");

    form.reset();

    preencherPadroes();
    atualizarTudo();
  });

  function encerrar(id) {
    const acesso = DB.find(KEY, id);

    if (!acesso) {
      mostrarToast("Acesso não encontrado.", "erro");
      atualizarTudo();
      return;
    }

    if (acesso.status !== "ativo") {
      mostrarToast("Este acesso já foi encerrado.", "erro");
      atualizarTudo();
      return;
    }

    const agora = obterDataHoraAtual();

    const inicio = converterDataHora(
      acesso.data,
      acesso.horaEntrada
    );

    const fim = converterDataHora(
      agora.data,
      agora.hora
    );

    if (!inicio || !fim || fim < inicio) {
      mostrarToast("Não foi possível validar o horário do acesso.", "erro");
      return;
    }

    DB.update(KEY, id, {
      horaSaida: agora.hora,
      dataSaida: agora.data,
      status: "encerrado"
    });

    mostrarToast("Acesso encerrado com sucesso!", "sucesso");

    atualizarTudo();
  }

  if (corpoAtivos) {
    corpoAtivos.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-encerrar]");

      if (!botao) return;

      encerrar(botao.dataset.encerrar);
    });
  }

  setInterval(() => {
    if (document.visibilityState === "visible") {
      atualizarTudo();
    }
  }, 30000);

  document.addEventListener("DOMContentLoaded", () => {
    preencherPadroes();
    atualizarTudo();
  });

}
