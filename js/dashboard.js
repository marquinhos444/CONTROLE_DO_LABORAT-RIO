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

  if (ativos.length === 0) {
    vazioAtivos.style.display = "block";
  } else {
    corpoAtivos.innerHTML = ativos
      .sort((a, b) => (a.horaEntrada < b.horaEntrada ? 1 : -1))
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
          </tr>`;
      })
      .join("");
  }

  const corpoMaquinas = document.getElementById("corpoMaquinas");
  const vazioMaquinas = document.getElementById("vazioMaquinas");

  if (maquinas.length === 0) {
    vazioMaquinas.style.display = "block";
  } else {
    corpoMaquinas.innerHTML = maquinas
      .map((m) => {
        const st = statusMaquina(m);
        return `
          <tr>
            <td>${escapeHtml(m.nome)}</td>
            <td>${escapeHtml(m.localizacao || "-")}</td>
            <td><span class="badge ${st.classe}">${st.texto}</span></td>
          </tr>`;
      })
      .join("");
  }
});
