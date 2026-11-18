const ITENS_MENU = [
  { chave: "dashboard", href: "index.html", texto: "Dashboard" },
  { chave: "monitores", href: "monitores.html", texto: "Monitores" },
  { chave: "usuarios", href: "usuarios.html", texto: "Usuários / Alunos" },
  { chave: "maquinas", href: "maquinas.html", texto: "Máquinas" },
  { chave: "acessos", href: "acessos.html", texto: "Acessos" },
  { chave: "relatorios", href: "relatorios.html", texto: "Relatórios" },
];

function montarSidebar() {
  const paginaAtual = document.body.dataset.page || "";
  const host = document.getElementById("sidebar");
  if (!host) return;

  const links = ITENS_MENU.map(
    (item) => `
      <a href="${item.href}" class="${item.chave === paginaAtual ? "active" : ""}">
        <span class="ic">${item.icone}</span>
        <span>${item.texto}</span>
      </a>`
  ).join("");

  host.innerHTML = `

        <h1>Controle de Laboratório</h1>
        <span>Gestão de acessos e monitoria</span>
      </div>
    </div>
    <nav>${links}</nav>
    <div class="rodape">Versão local &middot; sem banco de dados<br>Dados salvos neste navegador</div>
  `;
}

document.addEventListener("DOMContentLoaded", montarSidebar);
