const API = import.meta.env.VITE_API_BASE || "";
const immagini = {};

function byId(id) {
  return document.getElementById(id);
}
function val(id) {
  return byId(id)?.value?.trim() ?? "";
}
function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function toast(msg) {
  alert(msg);
}

function setupDropzones() {
  document.querySelectorAll(".image-drop").forEach((dropZone) => {
    const tipo = dropZone.dataset.id;

    // conserva il label iniziale (<i>…)
    const originalLabel = dropZone.querySelector("i");

    // input file nascosto (niente capture -> su iPad esce menu Camera/Libreria/File)
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    dropZone.appendChild(input);

    // preview + pulsante elimina
    const preview = document.createElement("img");
    preview.className =
      "object-cover w-full h-full rounded opacity-100 hover:opacity-60 transition-opacity";
    preview.style.display = "none";
    dropZone.appendChild(preview);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Elimina";
    delBtn.className =
      "absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700";
    delBtn.style.display = "none";
    dropZone.appendChild(delBtn);

    function setPreview(file) {
      if (!file || !file.type.startsWith("image/")) {
        toast("Seleziona un'immagine valida.");
        return;
      }
      immagini[tipo] = file;
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.onload = () => URL.revokeObjectURL(url);

      if (originalLabel) originalLabel.style.display = "none";
      preview.style.display = "block";
      delBtn.style.display = "inline-block";
      dropZone.classList.remove("ring-2", "ring-blue-500");
    }

    function resetPreview() {
      delete immagini[tipo];
      preview.src = "";
      preview.style.display = "none";
      delBtn.style.display = "none";
      if (originalLabel) originalLabel.style.display = "";
    }

    // click/tap apre il picker (tranne click su Elimina)
    dropZone.addEventListener("click", (e) => {
      if (e.target === delBtn) return;
      input.click();
    });

    input.addEventListener("change", () => {
      if (input.files && input.files[0]) {
        setPreview(input.files[0]);
        input.value = ""; // permette di riselezionare lo stesso file
      }
    });

    // drag&drop (desktop)
    ["dragenter", "dragover"].forEach((ev) =>
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add("ring-2", "ring-blue-500");
      })
    );
    ["dragleave", "drop"].forEach((ev) =>
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.remove("ring-2", "ring-blue-500");
      })
    );
    dropZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) setPreview(file);
    });

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetPreview();
    });
  });
}

async function caricaFormifici() {
  try {
    const res = await fetch(`${API}/api/aziende`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const aziende = await res.json(); // [{id, brand, ...}]
    const sel = byId("formificioInput");
    sel.innerHTML = '<option value=""></option>';
    aziende.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.brand;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn("Formifici non caricati:", e);
  }
}

async function caricaAccessorifici() {
  try {
    const res = await fetch(`${API}/api/aziende`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const aziende = await res.json();
    const sel = byId("accessorificioInput");
    sel.innerHTML = '<option value=""></option>';
    aziende.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.brand;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn("Accessorifici non caricati:", e);
  }
}

async function inviaDisegno() {
  const articolo = val("articoloInput"); // VARCHAR(10)
  const id_autore = toInt(val("autoreInput")); // FK utente.id
  const modello = val("modelloInput");
  const sigla_stagione = val("siglaInput"); // VARCHAR(5)
  const stagione = val("stagioneInput"); // ENUM
  const fondo_id_formificio = toInt(val("formificioInput")); // FK azienda.id
  const fondo_articolo = val("articoloFondoInput"); // VARCHAR(32)
  const id_accessorificio = toInt(val("accessorificioInput"));
  const accessorio_articolo = val("articoloAccessorioInput");
  const rendering = document.getElementById("renderingInput").checked ? 1 : 0;

  if (!articolo) return toast("Inserisci l'articolo.");
  if (!immagini.principale) return toast("Carica il file.");

  const btn = document.querySelector("button[type='submit']");
  btn.disabled = true;

  const fd = new FormData();
  fd.append("articolo", articolo);
  fd.append("id_autore", id_autore);
  fd.append("modello", modello);
  fd.append("stagione", stagione);
  fd.append("sigla_stagione", sigla_stagione);
  fd.append("rendering", rendering);
  fd.append("fondo_id_formificio", fondo_id_formificio);
  fd.append("fondo_articolo", fondo_articolo);
  fd.append("id_accessorificio", id_accessorificio);
  fd.append("articoloAccessorio", accessorio_articolo);
  fd.append("disegno", immagini.principale);

  try {
    const res = await fetch(`${API}/api/inserisci-disegno`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (json.success) {
      alert("Disegno inserito correttamente!");
      window.location.href = "inserimento.html";
    } else {
      console.error(json);
      alert(json.error || "Errore nell'inserimento.");
    }
  } catch (err) {
    console.error("Errore invio:", err);
    alert("Errore durante l'invio.");
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupDropzones();
  caricaFormifici();
  caricaAccessorifici();

  document
    .querySelector("button[type='submit']")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      inviaDisegno();
    });
});
