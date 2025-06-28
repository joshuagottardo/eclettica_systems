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

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function caricaArticolo(id) {
  const res = await fetch(`/api/articoli/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

function creaRiga(label, valore) {
  return `
    <tr>
      <td class="pr-4 text-right font-bold text-white">${label}</td>
      <td class="pl-4 italic text-gray-200" colspan="2">${valore || "-"}</td>
    </tr>
  `;
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

document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromUrl();
  if (!id) return;
  const articolo = await caricaArticolo(id);

  document.getElementById("nome").textContent = articolo.nome || "-";
  document.getElementById("brand").textContent = articolo.brand_azienda || "-";
  document.getElementById("azienda").textContent = articolo.nome_azienda || "-";

  // Costruisci la tabella dettagli
  const dettagli = [
    { label: "Tipo", val: articolo.tipo },
    { label: "Punta", val: articolo.punta },
    { label: "Tacco", val: articolo.tacco },
    { label: "Accessori", val: articolo.accessori },
    { label: "Altezza", val: articolo.altezza },
    { label: "Numero pezzi", val: articolo.numero_pezzi },
    // Qui puoi aggiungere altri campi
  ];

  const tbody = document.getElementById("tabella-dettagli");
  tbody.innerHTML = dettagli.map(d => creaRiga(d.label, d.val)).join("");

  await updateGalleria(id);
});
