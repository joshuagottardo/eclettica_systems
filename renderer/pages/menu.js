import { menu_ceppi } from "../globals.js";
import { menu_aziende } from "../globals.js";

const categoria = sessionStorage.getItem("categoriaSelezionata");
const container = document.getElementById("grigliaMenu");
const titolo = document.getElementById("titolo");

const mappa = {
  ceppi: menu_ceppi,
  aziende: menu_aziende
};

titolo.textContent = categoria.toUpperCase()

const menu = mappa[categoria] || [];

menu.forEach((item) => {
  const div = document.createElement("div");
  div.className =
    "h-36 p-3 pl-6 pr-6 bg-custom-700 rounded-xl shadow hover:bg-custom-500 transition cursor-pointer flex flex-col items-center justify-center";
  div.innerHTML = `
    <span class="material-symbols-outlined text-4xl mb-5 block">${
      item.icona
    }</span>
    <div class="font-inconsolata text-2xl">${item.nome.toUpperCase()}</div>
  `;

  div.addEventListener("click", () => {
    div.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = item.url;
    }, 400);
  });

  div.classList.add("fade-in-6");

  container.appendChild(div);
});
