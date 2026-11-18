const DB = {
  KEYS: {
    monitores: "lab_monitores",
    usuarios: "lab_usuarios",
    maquinas: "lab_maquinas",
    acessos: "lab_acessos",
  },

  getAll(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  },

  saveAll(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  },

  add(key, obj) {
    const arr = this.getAll(key);
    obj.id = gerarId();
    obj.criadoEm = Date.now();
    arr.push(obj);
    this.saveAll(key, arr);
    return obj;
  },

  update(key, id, updates) {
    const arr = this.getAll(key);
    const idx = arr.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...updates };
    this.saveAll(key, arr);
    return arr[idx];
  },

  remove(key, id) {
    const arr = this.getAll(key).filter((i) => i.id !== id);
    this.saveAll(key, arr);
  },

  find(key, id) {
    return this.getAll(key).find((i) => i.id === id) || null;
  },
};

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function hojeISO() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function horaAgora() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function formatarDataBR(iso) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function calcularDuracao(horaEntrada, horaSaida) {
  if (!horaEntrada || !horaSaida) return null;
  const [h1, m1] = horaEntrada.split(":").map(Number);
  const [h2, m2] = horaSaida.split(":").map(Number);
  let minutos = h2 * 60 + m2 - (h1 * 60 + m1);
  if (minutos < 0) minutos += 24 * 60;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return { minutos, texto: `${h}h ${String(m).padStart(2, "0")}min` };
}

function mostrarToast(msg, tipo = "sucesso") {
  let toast = document.getElementById("toastGlobal");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastGlobal";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast mostrar ${tipo}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2600);
}

function statusMaquina(maquina) {
  if (maquina.statusManual === "manutencao") {
    return { texto: "Manutenção", classe: "badge-amarelo" };
  }
  const acessos = DB.getAll(DB.KEYS.acessos);
  const emUso = acessos.some(
    (a) => a.maquinaId === maquina.id && a.status === "ativo"
  );
  if (emUso) return { texto: "Em uso", classe: "badge-azul" };
  return { texto: "Disponível", classe: "badge-verde" };
}

function maquinaEstaEmUso(maquinaId) {
  const acessos = DB.getAll(DB.KEYS.acessos);
  return acessos.some((a) => a.maquinaId === maquinaId && a.status === "ativo");
}

function alunoTemAcessoAtivo(alunoId) {
  const acessos = DB.getAll(DB.KEYS.acessos);
  return acessos.some((a) => a.alunoId === alunoId && a.status === "ativo");
}
