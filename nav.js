
const ITENS_MENU = [
  { chave: "dashboard", href: "index.html", texto: "Dashboard" },
  { chave: "monitores", href: "monitores.html", texto: "Monitores" },
  { chave: "usuarios", href: "usuarios.html", texto: "Usuários / Alunos" },
  { chave: "maquinas", href: "maquinas.html", texto: "Máquinas" },
  { chave: "acessos", href: "acessos.html", texto: "Acessos" },
  { chave: "relatorios", href: "relatorios.html", texto: "Relatórios" }
];

function montarSidebar() {
  const paginaAtual = document.body.dataset.page || "";
  const host = document.getElementById("sidebar");

  if (!host) {
    console.error("Elemento #sidebar não encontrado.");
    return;
  }

  host.innerHTML = "";

  const logo = document.createElement("div");
  logo.className = "logo";
  logo.innerHTML = `
    <h1>Controle de Laboratório</h1>
    <span>Gestão de acessos e monitoria</span>
  `;

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Menu principal");

  ITENS_MENU.forEach((item) => {
    const link = document.createElement("a");

    link.href = item.href;
    link.textContent = item.texto;

    if (item.chave === paginaAtual) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    nav.appendChild(link);
  });

  const rodape = document.createElement("div");
  rodape.className = "rodape";
  rodape.innerHTML = `
    Versão local &middot; sem banco de dados<br>
    Dados salvos neste navegador
  `;

  host.append(logo, nav, rodape);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montarSidebar);
} else {
  montarSidebar();
}