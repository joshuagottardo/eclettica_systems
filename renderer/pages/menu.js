import { menu_aziende, menu_persone, menu_archivio_storico, menu_archivio_disegni, menu_ceppi } from "../globals.js";

const categoria = sessionStorage.getItem("categoriaSelezionata");
const displayCategoria = sessionStorage.getItem("displayCategoriaSelezionata");
const container = document.getElementById("grigliaMenu");
const titolo = document.getElementById("titolo");

const mappa = {
  ceppi: menu_ceppi,
  aziende: menu_aziende,
  persone: menu_persone,
  archivio_storico: menu_archivio_storico,
  archivio_disegni: menu_archivio_disegni,
};

titolo.textContent = displayCategoria.toUpperCase()

const menu = mappa[categoria] || [];

menu.forEach((item, index) => {
  const div = document.createElement("div");
  div.className =
    "h-36 p-3 pl-6 pr-6 bg-custom-700 rounded-xl shadow hover:bg-custom-500 transition cursor-pointer flex flex-col items-center justify-center opacity-0";

  div.innerHTML = `
    <span class="material-symbols-outlined text-4xl mb-5 block">${item.icona}</span>
    <div class="font-inconsolata text-2xl">${item.nome.toUpperCase()}</div>
  `;

  div.addEventListener("click", () => {
      window.location.href = item.url;
  });

  // effetto fade-in progressivo
  setTimeout(() => {
    div.classList.remove("opacity-0");
    div.classList.add("fade-in-6");
  }, index * 180);

  container.appendChild(div);
});
