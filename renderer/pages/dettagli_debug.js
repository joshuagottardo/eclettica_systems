
document.addEventListener("DOMContentLoaded", () => {
  const id = parseInt(sessionStorage.getItem("articoloId"));
  const cache = JSON.parse(sessionStorage.getItem("cacheArticoli"));
  if (!id || !Array.isArray(cache)) {
    alert("Dati non disponibili.");
    return;
  }

  const articolo = cache.find(a => a.id === id);
  if (!articolo) {
    alert("Articolo non trovato.");
    return;
  }

  // DEBUG: stampa JSON in console
  console.log("Articolo selezionato:", articolo);
});