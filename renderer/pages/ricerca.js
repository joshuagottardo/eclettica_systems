let articoloCache = []; // solo id, nome, brand
let dettagliCache = new Map();
let aziendeCache = [];
let selectedTipo = null;
let filtriAperti = false;
let articoloSelezionato = null;

const FOTO_TIPI = [
  { chiave: "principale", label: "Principale" },
  { chiave: "esterno", label: "Esterno" },
  { chiave: "interno", label: "Interno" },
  { chiave: "sopra", label: "Sopra" },
  { chiave: "sotto", label: "Sotto" },
  { chiave: "punta", label: "Punta" },
  { chiave: "tacco", label: "Tacco" },
  { chiave: "accessori", label: "Accessori" },
  { chiave: "articolo", label: "Articolo" },
  { chiave: "finitura", label: "Finitura" },
];

function normalizza(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function caricaArticoli() {
  try {
    const res = await fetch("/api/articoli");
    if (!res.ok) throw new Error("HTTP " + res.status);
    articoloCache = await res.json();
    filtraArticoli(document.getElementById("searchInput").value);
  } catch (e) {
    console.error(e);
  }
}

async function caricaAziende() {
  try {
    const res = await fetch("/api/aziende");
    if (!res.ok) throw new Error("HTTP " + res.status);
    aziendeCache = await res.json();
    const sel = document.getElementById("filtroAzienda");
    sel.innerHTML = '<option value="">Tutte</option>';
    aziendeCache.forEach((a) => {
      const o = document.createElement("option");
      o.value = a.brand;
      o.textContent = a.brand;
      sel.appendChild(o);
    });
  } catch (e) {
    console.error(e);
  }
}

async function updateGalleria(idArticolo) {
  const galleria = document.getElementById("galleria-foto");
  galleria.innerHTML = "";
  for (const f of FOTO_TIPI) {
    const imgPath = `/api/articoli/${idArticolo}/foto/${f.chiave}`;
    const div = document.createElement("div");
    div.className = "cursor-pointer relative";
    div.innerHTML = `
      <img src="${imgPath}" alt="${f.label}" class="rounded w-full aspect-square object-cover transition hover:scale-105" onerror="this.style.display='none'"/>
      <div class="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">${f.label}</div>
    `;
    galleria.appendChild(div);
  }
}

function filtraArticoli(term) {
  const lista = document.getElementById("lista-articoli");
  lista.innerHTML = "";
  const f = normalizza(term);
  const azienda = document.getElementById("filtroAzienda")?.value || "";
  const filtered = articoloCache.filter(
    (a) =>
      normalizza(a.nome).includes(f) &&
      (!selectedTipo || a.tipo === selectedTipo) &&
      (!azienda || a.brand_azienda === azienda)
  );
  if (!filtered.length) {
    lista.innerHTML = "<p class='text-gray-400'>Nessun risultato</p>";
    return;
  }
  filtered.forEach((a) => {
    const d = document.createElement("div");
    d.dataset.id = a.id;
    d.className =
      "p-3 bg-custom-800 rounded shadow hover:bg-custom-700 cursor-pointer";
    d.innerHTML = `
      <div class="flex justify-between text-white">
        <span>${a.nome}</span>
        ${a.brand_azienda ? `<span class="text-neutral-700">${a.brand_azienda}</span>` : ""}
      </div>`;
    lista.appendChild(d);
  });
  // Nascondi il bottone vedi dettagli
  document.getElementById("vedi-dettagli-btn").style.display = "none";
  articoloSelezionato = null;
}

async function mostraDettagliArticolo(id) {
  let articolo = dettagliCache.get(id);
  if (!articolo) {
    try {
      const res = await fetch(`/api/articoli/${id}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      articolo = await res.json();
      dettagliCache.set(id, articolo);
    } catch (e) {
      console.error(e);
      return;
    }
  }
  // Mapping tra chiavi JS e id DOM
  const mapping = {
    nome: "dettagli-nome",
    brand_azienda: "dettagli-brand",
    nome_azienda: "dettagli-azienda",
    tipo: "dettagli-tipo",
    punta: "dettagli-punta",
    tacco: "dettagli-tacco",
    accessori: "dettagli-accessori",
    altezza: "dettagli-altezza",
    numero_pezzi: "dettagli-pezzi",
  };
  Object.entries(mapping).forEach(([k, domId]) => {
    const el = document.getElementById(domId);
    if (el) el.textContent = articolo[k] ?? "-";
  });

  updateGalleria(articolo.id);
  articoloSelezionato = articolo.id;
  document.getElementById("vedi-dettagli-btn").style.display = "block";
}

document.querySelectorAll('input[name="filtroTipo"]').forEach((radio) => {
  radio.addEventListener("click", function () {
    if (selectedTipo === this.value) {
      this.checked = false;
      selectedTipo = null;
    } else {
      selectedTipo = this.value;
    }
    filtraArticoli(document.getElementById("searchInput").value);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("searchInput")
    ?.addEventListener("input", (e) => filtraArticoli(e.target.value));
  document
    .getElementById("refreshBtn")
    ?.addEventListener("click", caricaArticoli);
  document
    .getElementById("filtroAzienda")
    ?.addEventListener("change", () =>
      filtraArticoli(document.getElementById("searchInput").value)
    );
  document.getElementById("lista-articoli")?.addEventListener("click", (e) => {
    const item = e.target.closest("[data-id]");
    if (item) mostraDettagliArticolo(item.dataset.id);
  });
  document.getElementById("toggleFiltri")?.addEventListener("click", () => {
    const wrapper = document.getElementById("filtroWrapper"),
      ic = document.getElementById("frecciaToggle");
    filtriAperti = !filtriAperti;
    ic.classList.toggle("rotate-180");
    wrapper.style.maxHeight = filtriAperti
      ? wrapper.scrollHeight + "px"
      : "0px";
  });

  // Vedi dettagli
  document.getElementById("vedi-dettagli-btn").addEventListener("click", () => {
    if (articoloSelezionato) {
      window.location.href = `/dettagli.html?id=${articoloSelezionato}`;
    }
  });

  caricaAziende();
  caricaArticoli();
});
