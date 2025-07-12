const immagini = {}; // { tipo: File }
let mappaStatoCitta = {};
let materialiDisponibili = [];

async function caricaMateriali() {
  try {
    const res = await fetch("/api/materiali");
    if (!res.ok) throw new Error("HTTP " + res.status);
    materialiDisponibili = await res.json();
    creaRadioPill(
      "filtroMateriali",
      materialiDisponibili,
      "materiali",
      "checkbox"
    );

    const container = document.getElementById("filtroMateriali");
    container.classList.remove("opacity-0");
  } catch (err) {
    console.error("Errore caricamento materiali:", err);
  }
}

async function caricaFiniture() {
  try {
    const res = await fetch("/api/finiture");
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
        }
      });
    }
    label.appendChild(input);
    label.appendChild(pill);
    container.appendChild(label);
  });
}

async function caricaAziende() {
  try {
    const res = await fetch("/api/aziende");
    const aziende = await res.json();
    const selectAzienda = document.getElementById("filtroAzienda");
    const selectAziendaForma = document.getElementById("filtroAziendaForma");
    [selectAzienda, selectAziendaForma].forEach((select) => {
      aziende.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.brand;
        select.appendChild(opt);
      });
    });
  } catch (err) {
    console.error("Errore caricamento aziende:", err);
  }
}

async function caricaStatiECitta() {
  try {
    const res = await fetch("/api/articoli");
    const articoli = await res.json();
    const statiSet = new Set();
    mappaStatoCitta = {};
    articoli.forEach((a) => {
      if (a.stato_produzione) statiSet.add(a.stato_produzione);
      if (a.stato_produzione && a.citta_produzione) {
        if (!mappaStatoCitta[a.stato_produzione]) {
          mappaStatoCitta[a.stato_produzione] = new Set();
        }
        mappaStatoCitta[a.stato_produzione].add(a.citta_produzione);
      }
    });

    const selectStato = document.getElementById("filtroStatoProduzione");
    statiSet.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selectStato.appendChild(opt);
    });

    selectStato.addEventListener("change", () => {
      const cittaSelect = document.getElementById("filtroCittaProduzione");
      cittaSelect.innerHTML = "";
      const selected = selectStato.value;
      if (mappaStatoCitta[selected]) {
        Array.from(mappaStatoCitta[selected])
          .sort()
          .forEach((c) => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            cittaSelect.appendChild(opt);
          });
      }
    });
  } catch (err) {
    console.error("Errore caricamento stati/città:", err);
  }
}

// GESTIONE DROPZONE IMMAGINI
function setupDropzones() {
  document.querySelectorAll(".image-drop").forEach((dropZone) => {
    const tipo = dropZone.dataset.id;
    const originalText = dropZone.innerHTML;

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("ring-2", "ring-blue-500");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("ring-2", "ring-blue-500");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("ring-2", "ring-blue-500");

      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) {
        alert("Trascina un'immagine valida.");
        return;
      }

      immagini[tipo] = file;

      const reader = new FileReader();
      reader.onload = (event) => {
        dropZone.innerHTML = `
          <img src="${event.target.result}" class="object-cover w-full h-full rounded opacity-100 hover:opacity-60 transition-opacity" />
          <button class="delete-btn absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700">Elimina</button>
        `;
        const deleteBtn = dropZone.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dropZone.innerHTML = originalText;
          delete immagini[tipo];
        });
      };
      reader.readAsDataURL(file);
    });
  });
}

// INVIO FORM
async function inviaArticolo() {
  const codice = document.getElementById("filtroCodice").value;
  const azienda = document.getElementById("filtroAzienda").value;
  const tipologia = document.querySelector(
    'input[name="tipologia"]:checked'
  )?.value;
  const punta = document.querySelector('input[name="punta"]:checked')?.value;
  const altezza = document.getElementById("filtroAltezza").value;
  const matricola = document.getElementById("filtroMatricolaForma").value;
  const aziendaForma = document.getElementById("filtroAziendaForma").value;
  const stato = document.getElementById("filtroStatoProduzione").value;
  const citta = document.getElementById("filtroCittaProduzione").value;

  const materiali = Array.from(
    document.querySelectorAll('input[name="materiali"]:checked')
  ).map((el) => el.value);

  if (!codice || !tipologia || !punta || !altezza) {
    alert("Compila tutti i campi obbligatori.");
    return;
  }

  const formData = new FormData();
  formData.append("codice", codice);
  formData.append("azienda", azienda);
  formData.append("tipologia", tipologia);
  formData.append("punta", punta);
  formData.append("altezza_tacco", altezza);
  formData.append("matricola_forma", matricola);
  formData.append("azienda_forma", aziendaForma);
  formData.append("stato_produzione", stato);
  formData.append("citta_produzione", citta);
  materiali.forEach((m) => formData.append("materiali[]", m));

  for (const tipo in immagini) {
    formData.append("immagine_" + tipo, immagini[tipo]);
  }

  try {
    const res = await fetch("/api/articoli", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      alert("Articolo inserito correttamente!");
      window.location.href = "/ricerca.html";
    } else {
      alert("Errore nell'inserimento.");
      console.error(data);
    }
  } catch (err) {
    console.error("Errore di invio:", err);
    alert("Errore durante l'invio dei dati.");
  }
}

// SETUP INIZIALE
document.addEventListener("DOMContentLoaded", () => {
  creaRadioPill(
    "filtroTipologia",
    ["ceppo", "ceppo tacco", "zeppa"],
    "tipologia"
  );
  creaRadioPill("filtroPunta", ["tonda", "punta", "quadra"], "punta");
  caricaAziende();
  caricaStatiECitta();
  caricaMateriali();
  caricaFiniture();
  setupDropzones();

  document
    .querySelector("button[type='submit']")
    ?.addEventListener("click", inviaArticolo);
});
