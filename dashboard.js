
document.addEventListener("DOMContentLoaded", () => {
  const monitores = DB.getAll(DB.KEYS.monitores);
  const usuarios = DB.getAll(DB.KEYS.usuarios);
  const maquinas = DB.getAll(DB.KEYS.maquinas);
  const acessos = DB.getAll(DB.KEYS.acessos);

  const ativos = acessos.filter((a) => a.status === "ativo");

  document.getElementById("statMonitores").textContent = monitores.length;
  document.getElementById("statUsuarios").textContent = usuarios.length;
  document.getElementById("statMaquinas").textContent = maquinas.length;
  document.getElementById("statAtivos").textContent = ativos.length;

  const corpoAtivos = document.getElementById("corpoAtivos");
  const vazioAtivos = document.getElementById("vazioAtivos");

  if (corpoAtivos && vazioAtivos) {
    if (ativos.length === 0) {
      corpoAtivos.innerHTML = "";
      vazioAtivos.style.display = "block";
    } else {
      vazioAtivos.style.display = "none";

      const agora = new Date();

      corpoAtivos.innerHTML = ativos
        .sort((a, b) => {
          const dataA = new Date(`${a.data}T${a.horaEntrada}:00`);
          const dataB = new Date(`${b.data}T${b.horaEntrada}:00`);

          return dataB - dataA;
        })
        .map((a) => {
          const aluno = usuarios.find((u) => u.id === a.alunoId);
          const maquina = maquinas.find((m) => m.id === a.maquinaId);

          const inicio = new Date(`${a.data}T${a.horaEntrada}:00`);
          const minutos = Math.max(
            0,
            Math.floor((agora - inicio) / 60000)
          );

          const horas = Math.floor(minutos / 60);
          const minutosRestantes = minutos % 60;

          const textoDuracao =
            `${horas}h ${String(minutosRestantes).padStart(2, "0")}min`;

          return `
            <tr>
              <td>${escapeHtml(aluno ? aluno.nome : "Aluno removido")}</td>
              <td>${escapeHtml(aluno ? aluno.turma || "-" : "-")}</td>
              <td>${escapeHtml(maquina ? maquina.nome : "Máquina removida")}</td>
              <td>${escapeHtml(formatarDataBR(a.data))}</td>
              <td>${escapeHtml(a.horaEntrada || "-")}</td>
              <td>
                <span class="badge badge-verde">
                  ${textoDuracao}
                </span>
              </td>
            </tr>
          `;
        })
        .join("");
    }
  }
  
  const corpoMaquinas = document.getElementById("corpoMaquinas");
  const vazioMaquinas = document.getElementById("vazioMaquinas");

  if (corpoMaquinas && vazioMaquinas) {
    if (maquinas.length === 0) {
      corpoMaquinas.innerHTML = "";
      vazioMaquinas.style.display = "block";
    } else {
      vazioMaquinas.style.display = "none";

      corpoMaquinas.innerHTML = maquinas
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((m) => {
          const st = statusMaquina(m);

          return `
            <tr>
              <td>${escapeHtml(m.nome || "-")}</td>
              <td>${escapeHtml(m.localizacao || "-")}</td>
              <td>
                <span class="badge ${escapeHtml(st.classe)}">
                  ${escapeHtml(st.texto)}
                </span>
              </td>
            </tr>
          `;
        })
        .join("");
    }
  }
});
