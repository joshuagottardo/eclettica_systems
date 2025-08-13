// --- INIZIALIZZAZIONE E CARICAMENTO ---
const API = import.meta.env.VITE_API_BASE || "";

let cacheArticoli = [];
let materialiDisponibili = [];
let mappaStatoCitta = {};

const galleriaArticoli = document.getElementById("galleria-articoli");

function normalizza(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

async function caricaArticoli() {
  mostraLoader();
  const start = performance.now(); // ⏱️ avvia cronometro

  try {
    const res = await fetch(`${API}/api/articoli`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    cacheArticoli = await res.json();

    sessionStorage.setItem("cacheArticoli", JSON.stringify(cacheArticoli));
    popolaFiltri();
    applicaFiltri();
  } catch (err) {
    console.error("Errore caricamento articoli:", err);
  } finally {
    const elapsed = performance.now() - start;
    const remaining = Math.max(0, 400 - elapsed); // 🔁 attesa residua
    setTimeout(() => {
      nascondiLoader();
    }, remaining);
  }
}

function apriDettaglio(id) {
  sessionStorage.setItem("articoloId", id);
  window.location.href = "/dettagli.html";
}

async function caricaMateriali() {
  try {
    const res = await fetch(`${API}/api/materiali`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    materialiDisponibili = await res.json();
    creaRadioPill(
      "filtroMateriali",
      materialiDisponibili,
      "materiali",
      "checkbox"
    );

    document.getElementById("filtroMateriali")?.classList.remove("opacity-0");
  } catch (err) {
    console.error("Errore caricamento materiali:", err);
  }
}

async function caricaFiniture() {
  try {
    const res = await fetch(`${API}/api/finiture`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const finiture = await res.json();

    const select = document.getElementById("filtroFinitura");
    select.innerHTML = '<option value="">Tutte</option>';

    finiture.sort().forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Errore caricamento finiture:", err);
  }
}

function popolaFiltri() {
  const aziendeSet = new Set();
  const statiSet = new Set();
  const cittaSet = new Set();
  const aziendeFormaSet = new Set();
  mappaStatoCitta = {};

  cacheArticoli.forEach((a) => {
    if (a.azienda) aziendeSet.add(a.azienda);
    if (a.stato_produzione) statiSet.add(a.stato_produzione);
    if (a.citta_produzione) {
      cittaSet.add(a.citta_produzione);
      if (a.stato_produzione) {
        if (!mappaStatoCitta[a.stato_produzione]) {
          mappaStatoCitta[a.stato_produzione] = new Set();
        }
        mappaStatoCitta[a.stato_produzione].add(a.citta_produzione);
      }
    }
    if (a.azienda_forma) aziendeFormaSet.add(a.azienda_forma);
  });

  const creaOpzioni = (select, valori) => {
    select.innerHTML = '<option value="">Tutte</option>';
    Array.from(valori)
      .sort()
      .forEach((val) => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
      });
  };

  creaOpzioni(document.getElementById("filtroAzienda"), aziendeSet);
  creaOpzioni(document.getElementById("filtroStatoProduzione"), statiSet);
  creaOpzioni(document.getElementById("filtroCittaProduzione"), cittaSet);
  creaOpzioni(document.getElementById("filtroAziendaForma"), aziendeFormaSet);
}

function aggiornaCittaDaStato(statoSelezionato) {
  const selectCitta = document.getElementById("filtroCittaProduzione");
  const valori = mappaStatoCitta[statoSelezionato] || new Set();

  selectCitta.innerHTML = '<option value="">Tutte</option>';
  Array.from(valori)
    .sort()
    .forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      selectCitta.appendChild(opt);
    });
}

function creaRadioPill(containerId, nomi, nomeFiltro, tipo = "radio") {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  nomi.forEach((val) => {
    const label = document.createElement("label");
    label.className = "cursor-pointer";

    const input = document.createElement("input");
    input.type = tipo;
    input.name = nomeFiltro;
    input.value = val;
    input.className = "peer hidden";

    const pill = document.createElement("div");
    pill.className =
      "px-4 py-2 rounded-full border border-custom-950 bg-custom-900 text-neutral-600 peer-hover:text-white peer-checked:bg-custom-500 peer-checked:border-custom-500 peer-checked:text-white transition";
    pill.textContent = val;

    if (tipo === "radio") {
      let wasChecked = false;

      label.addEventListener("pointerdown", () => {
        wasChecked = input.checked;
      });

      label.addEventListener("click", (e) => {
        if (wasChecked) {
          e.preventDefault();
          input.checked = false;

          // 🔥 Trigger manuale dell'evento change
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }

    input.addEventListener("change", () => {
      applicaFiltri(); // aggiornamento automatico dei filtri
    });

    label.appendChild(input);
    label.appendChild(pill);
    container.appendChild(label);
  });
}

function getFiltriCorrenti() {
  return {
    codice:
      document.getElementById("filtroCodice")?.value.trim().toLowerCase() || "",
    azienda: document.getElementById("filtroAzienda")?.value || "",
    tipologia:
      document.querySelector('input[name="tipologia"]:checked')?.value || "",
    punta: document.querySelector('input[name="punta"]:checked')?.value || "",
    materiali: Array.from(
      document.querySelectorAll('input[name="materiali"]:checked')
    ).map((e) => e.value),
    altezza: parseInt(document.getElementById("filtroAltezza")?.value) || null,
    finitura: document.getElementById("filtroFinitura")?.value || "",
    matricola:
      document
        .getElementById("filtroMatricolaForma")
        ?.value.trim()
        .toLowerCase() || "",
    aziendaForma: document.getElementById("filtroAziendaForma")?.value || "",
    stato: document.getElementById("filtroStatoProduzione")?.value || "",
    citta: document.getElementById("filtroCittaProduzione")?.value || "",
    inSerie: document.getElementById("filtroInSerie")?.checked || false, // 👈 AGGIUNTA
  };
}

function applicaFiltri() {
  const galleria = document.getElementById("galleria-articoli");
  if (!galleria) return;

  const f = getFiltriCorrenti();
  const risultati = cacheArticoli.filter((a) => {
    return (
      (!f.codice || a.codice?.toLowerCase().includes(f.codice)) &&
      (!f.azienda || a.azienda === f.azienda) &&
      (!f.tipologia || a.tipologia === f.tipologia) &&
      (!f.punta || a.punta === f.punta) &&
      (!f.materiali.length ||
        f.materiali.every((m) => a.materiali?.includes(m))) &&
      (!f.altezza || a.altezza_tacco === f.altezza) &&
      (!f.finitura || a.finitura === f.finitura) &&
      (!f.matricola ||
        a.matricola_forma?.toLowerCase().includes(f.matricola)) &&
      (!f.aziendaForma || a.azienda_forma === f.aziendaForma) &&
      (!f.stato || a.stato_produzione === f.stato) &&
      (!f.citta || a.citta_produzione === f.citta) &&
      (!f.inSerie || a.in_serie === 1)
    );
  });

  galleria.innerHTML = risultati.length
    ? risultati
        .map((articolo) => {
          return `<div onclick="apriDettaglio(${articolo.id})" class="cursor-pointer bg-custom-800 rounded-xl shadow p-4 flex flex-col items-center text-center">
          <img src="${API}/immagini/articoli/${articolo.id}/principale.jpg" alt="${articolo.codice}" onerror="this.src='../resources/img/placeholder.jpg'" class="w-full aspect-square object-cover rounded mb-2" />
          
        </div>`;
        })
        .join("")
    : `<p class="text-gray-400 col-span-2">Nessun risultato trovato.</p>`;
}

function mostraLoader() {
  document.getElementById("loaderOverlay")?.classList.remove("hidden");
  galleriaArticoli.classList.add("hidden");
}

function nascondiLoader() {
  document.getElementById("loaderOverlay")?.classList.add("hidden");
  galleriaArticoli.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshBtn")?.addEventListener("click", () => {
    caricaArticoli();
    caricaMateriali();
  });

  caricaArticoli();
  caricaMateriali();
  caricaFiniture();

  creaRadioPill(
    "filtroTipologia",
    ["ceppo", "ceppo tacco", "zeppa"],
    "tipologia"
  );
  creaRadioPill("filtroPunta", ["tonda", "sfilata", "quadra"], "punta");

  [
    "filtroCodice",
    "filtroAzienda",
    "filtroAltezza",
    "filtroMatricolaForma",
    "filtroAziendaForma",
    "filtroStatoProduzione",
    "filtroCittaProduzione",
    "filtroFinitura",
    "filtroInSerie",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", applicaFiltri);
    document.getElementById(id)?.addEventListener("change", applicaFiltri);
  });

  document
    .getElementById("filtroStatoProduzione")
    ?.addEventListener("change", (e) => {
      aggiornaCittaDaStato(e.target.value);
      applicaFiltri();
    });

  window.apriDettaglio = function (id) {
    sessionStorage.setItem("articoloId", id);
    window.location.href = "dettagli.html";
  };
});
