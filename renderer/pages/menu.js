import { menu_ceppi } from "../globals.js";

const categoria = sessionStorage.getItem("categoriaSelezionata");
const container = document.getElementById("grigliaMenu");

const mappa = {
  ceppi: menu_ceppi,
};

const menu = mappa[categoria] || [];

menu.forEach((item) => {
  const div = document.createElement("div");
  div.className =
    "h-32 p-6 bg-custom-700 rounded-xl shadow hover:bg-custom-500 transition cursor-pointer flex flex-col items-center justify-center";
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
    }, 500);
  });

  div.classList.add("fade-in");

  container.appendChild(div);
});
