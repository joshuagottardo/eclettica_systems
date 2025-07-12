document.addEventListener("DOMContentLoaded", () => {
  const id = parseInt(sessionStorage.getItem("articoloId"));
  const cache = JSON.parse(sessionStorage.getItem("cacheArticoli"));
  if (!id || !Array.isArray(cache)) {
    alert("Dati non disponibili.");
    return;
  }

  const articolo = cache.find((a) => a.id === id);
  if (!articolo) {
    alert("Articolo non trovato.");
    return;
  }

  const mostra = (val) => (val != null && val !== "" ? val : "-");

  const assegna = (id, valore) => {
    const el = document.getElementById(id);
    if (el) el.textContent += " " + mostra(valore);
  };

  assegna("campoCodice", articolo.codice);
  assegna("campoAzienda", articolo.azienda);
  assegna("campoTipologia", articolo.tipologia);
  assegna("campoPunta", articolo.punta);
  assegna("campoAltezzaTacco", articolo.altezza_tacco);
  assegna("campoFinitura", articolo.finitura);
  assegna("campoMatricolaForma", articolo.matricola_forma);
  assegna("campoAziendaForma", articolo.azienda_forma);
  assegna("campoStatoProduzione", articolo.stato_produzione);
  assegna("campoCittaProduzione", articolo.citta_produzione);

  const lista = document.getElementById("listaMateriali");
  if (lista && Array.isArray(articolo.materiali)) {
    const ul = document.createElement("ul");
    ul.className = "list-disc pl-5";
    articolo.materiali.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = m;
      ul.appendChild(li);
    });
    lista.appendChild(ul);
  }

  const BASE_URL = "https://trentin-nas.synology.me";
  document.querySelectorAll(".image-drop").forEach((div) => {
    const tipo = div.dataset.id;
    const img = document.createElement("img");
    img.src = `${BASE_URL}/immagini/articoli/${id}/${tipo}.jpg`;
    img.alt = tipo;
    img.className = "object-cover w-full h-full rounded";
    img.onerror = () => div.classList.add("opacity-30");
    div.innerHTML = "";
    div.appendChild(img);
    img.addEventListener("click", () => {
      popupImage.src = img.src;
      popupOverlay.classList.remove("hidden");
    });
  });
});

popupOverlay.addEventListener("click", () => {
  popupOverlay.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    popupOverlay.classList.add("hidden");
  }
});
