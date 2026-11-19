const ITENS_MENU = [
  {
    chave: "dashboard",
    href: "dashboard.html",
    texto: "Dashboard"
  },
  {
    chave: "monitores",
    href: "monitores.html",
    texto: "Monitores"
  },
  {
    chave: "usuarios",
    href: "usuarios.html",
    texto: "Usuários / Alunos"
  },
  {
    chave: "maquinas",
    href: "maquinas.html",
    texto: "Máquinas"
  },
  {
    chave: "acessos",
    href: "acessos.html",
    texto: "Acessos"
  },
  {
    chave: "relatorios",
    href: "relatorios.html",
    texto: "Relatórios"
  }
];

function montarSidebar() {

  const paginaAtual = document.body.dataset.page || "";

  const host = document.getElementById("sidebar");

  if (!host) {
    console.error("Elemento #sidebar não encontrado no HTML.");
    return;
  }

  const links = ITENS_MENU.map((item) => {

    const classeAtiva =
      item.chave === paginaAtual ? "active" : "";

    const paginaAtiva =
      item.chave === paginaAtual
        ? 'aria-current="page"'
        : "";

    return `
      <a
        href="${item.href}"
        class="${classeAtiva}"
        ${paginaAtiva}
      >
        <span>${item.texto}</span>
      </a>
    `;

  }).join("");

  host.innerHTML = `
    <div class="logo">
      <h1>Controle de Laboratório</h1>
      <span>Gestão de acessos e monitoria</span>
    </div>

    <nav aria-label="Menu principal">
      ${links}
    </nav>

    <div class="rodape">
      Versão local &middot; sem banco de dados<br>
      Dados salvos neste navegador
    </div>
  `;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montarSidebar);
} else {
  montarSidebar();
}