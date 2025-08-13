const API = import.meta.env.VITE_API_BASE || "";
const immagini = {};
let mappaStatoCitta = {};
let materialiDisponibili = [];

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

    const container = document.getElementById("filtroMateriali");
    container.classList.remove("opacity-0");
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
    select.innerHTML = '<option value=""></option>';

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
    const res = await fetch(`${API}/api/aziende`);
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
    const res = await fetch(`${API}/api/articoli`);
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

      //Aggiungi un'opzione vuota
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "";
      cittaSelect.appendChild(opt);

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

function setupDropzones() {
  document.querySelectorAll(".image-drop").forEach((dropZone) => {
    const tipo = dropZone.dataset.id;

    // Ricordiamo il contenuto iniziale (il <i> "foto principale"...)
    const originalHTML = dropZone.innerHTML;
    const originalLabelEl = dropZone.querySelector("i");

    // 1) Crea input file nascosto (anche fotocamera su iPad)
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.hidden = true;
    dropZone.appendChild(input);

    // 2) Crea elementi preview e pulsante elimina (inizialmente nascosti)
    const preview = document.createElement("img");
    preview.className =
      "object-cover w-full h-full rounded opacity-100 hover:opacity-60 transition-opacity";
    preview.style.display = "none";
    dropZone.appendChild(preview);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Elimina";
    delBtn.className =
      "delete-btn absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700";
    delBtn.style.display = "none";
    dropZone.appendChild(delBtn);

    // 3) Utilità comune per applicare la preview e salvare il file
    function setPreview(file) {
      if (!file || !file.type.startsWith("image/")) {
        alert("Seleziona un'immagine valida.");
        return;
      }
      immagini[tipo] = file;

      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.onload = () => URL.revokeObjectURL(url);

      if (originalLabelEl) originalLabelEl.style.display = "none";
      preview.style.display = "block";
      delBtn.style.display = "inline-block";
      dropZone.classList.remove("ring-2", "ring-blue-500");
    }

    function resetPreview() {
      delete immagini[tipo];
      preview.src = "";
      preview.style.display = "none";
      delBtn.style.display = "none";
      if (originalLabelEl) {
        originalLabelEl.style.display = "";
      } else {
        // fallback, se non trova <i> ripristina HTML testuale
        dropZone.innerHTML = originalHTML;
        // ATTENZIONE: se ripristini innerHTML, devi riagganciare tutto.
        // Per semplicità non lo facciamo: manteniamo originalLabelEl.
      }
    }

    // 4) Click/tap sul riquadro -> apri picker (ma non se clicchi "Elimina")
    dropZone.addEventListener("click", (e) => {
      if (e.target === delBtn) return;
      input.click();
    });

    // 5) Cambio file dal picker
    input.addEventListener("change", () => {
      if (input.files && input.files[0]) {
        setPreview(input.files[0]);
        input.value = ""; // consente di riselezionare lo stesso file
      }
    });

    // 6) Drag & Drop (desktop)
    ["dragenter", "dragover"].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add("ring-2", "ring-blue-500");
      });
    });
    ["dragleave", "drop"].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.remove("ring-2", "ring-blue-500");
      });
    });
    dropZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) setPreview(file);
    });

    // 7) Elimina
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetPreview();
    });
  });
}

// INVIO FORM
async function inviaArticolo() {
  const codice = document.getElementById("filtroCodice").value.trim();
  if (!codice) {
    alert("Il campo CODICE è obbligatorio.");
    return;
  }

  const tipologia =
    document.querySelector('input[name="tipologia"]:checked')?.value || null;
  const punta =
    document.querySelector('input[name="punta"]:checked')?.value || null;
  const altezza = parseInt(document.getElementById("filtroAltezza").value) || 0;
  const azienda = document.getElementById("filtroAzienda").value || null;
  const aziendaForma =
    document.getElementById("filtroAziendaForma").value || null;
  const finitura = document.getElementById("filtroFinitura").value || null;
  const stato = document.getElementById("filtroStatoProduzione").value || null;
  const citta = document.getElementById("filtroCittaProduzione").value || null;
  const matricola =
    document.getElementById("filtroMatricolaForma").value.trim() || null;
  const accessorio =
    document.getElementById("filtroAccessorio")?.value?.trim() || null;

  const materiali = Array.from(
    document.querySelectorAll('input[name="materiali"]:checked')
  ).map((el) => el.value);

  const in_serie = document.getElementById("inSerieCheckbox").checked ? 1 : 0;

  if (!immagini["principale"]) {
    alert("La foto principale è obbligatoria.");
    return;
  }

  const formData = new FormData();
  formData.append("codice", codice);
  if (tipologia) formData.append("tipologia", tipologia);
  if (punta) formData.append("punta", punta);
  formData.append("altezza_tacco", altezza);
  if (azienda) formData.append("azienda", azienda);
  if (aziendaForma) formData.append("azienda_forma", aziendaForma);
  if (finitura) formData.append("finitura", finitura);
  if (stato) formData.append("stato_produzione", stato);
  if (citta) formData.append("citta_produzione", citta);
  if (matricola) formData.append("matricola_forma", matricola);
  if (accessorio) formData.append("accessorio", accessorio);
  formData.append("in_serie", in_serie);
  materiali.forEach((m) => formData.append("materiali[]", m));

  for (const tipo in immagini) {
    formData.append("immagine_" + tipo, immagini[tipo]);
  }

  try {
    const res = await fetch(`${API}/api/articoli`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      alert("Articolo inserito correttamente!");
      window.location.href = "inserimento.html";
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
  creaRadioPill("filtroPunta", ["tonda", "sfilata", "quadra"], "punta");
  caricaAziende();
  caricaStatiECitta();
  caricaMateriali();
  caricaFiniture();
  setupDropzones();

  document
    .querySelector("button[type='submit']")
    ?.addEventListener("click", inviaArticolo);
});

function mostraPopup(titolo, callback) {
  const overlay = document.getElementById("popupOverlay");
  const input = document.getElementById("popupInput");
  const errore = document.getElementById("popupErrore");
  document.getElementById("popupTitle").textContent = titolo;
  input.value = "";
  errore.classList.add("hidden");

  overlay.classList.remove("hidden");

  const annulla = () => {
    overlay.classList.add("hidden");
    conferma.removeEventListener("click", confermaHandler);
    annullaBtn.removeEventListener("click", annulla);
  };

  const confermaHandler = async () => {
    const valore = input.value.trim();
    if (!valore) return;

    const erroreMessaggio = await callback(valore);
    if (erroreMessaggio) {
      errore.textContent = erroreMessaggio;
      errore.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      conferma.removeEventListener("click", confermaHandler);
      annullaBtn.removeEventListener("click", annulla);
    }
  };

  const conferma = document.getElementById("popupConferma");
  const annullaBtn = document.getElementById("popupAnnulla");
  conferma.addEventListener("click", confermaHandler);
  annullaBtn.addEventListener("click", annulla);
}

document.getElementById("btnAggiungiStato")?.addEventListener("click", () => {
  mostraPopup("Aggiungi stato produzione", async (valore) => {
    const res = await fetch(`${API}/api/stati`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: valore }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || "Errore generico";
    const select = document.getElementById("filtroStatoProduzione");
    const opt = document.createElement("option");
    opt.value = valore;
    opt.textContent = valore;
    select.appendChild(opt);
    select.value = valore;
    select.dispatchEvent(new Event("change"));
    return null;
  });
});

document.getElementById("btnAggiungiCitta")?.addEventListener("click", () => {
  const stato = document.getElementById("filtroStatoProduzione").value;
  if (!stato) {
    alert("Seleziona prima uno stato.");
    return;
  }

  mostraPopup("Aggiungi città di produzione", async (valore) => {
    const res = await fetch(`${API}/api/citta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stato, nome: valore }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || "Errore generico";
    const select = document.getElementById("filtroCittaProduzione");
    const opt = document.createElement("option");
    opt.value = valore;
    opt.textContent = valore;
    select.appendChild(opt);
    select.value = valore;
    return null;
  });
});
