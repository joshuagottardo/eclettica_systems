import { set } from "zod/v4";
import { categorie } from "../globals.js";

const container = document.getElementById("grigliaCategorie");

categorie.forEach((cat, index) => {
  const div = document.createElement("div");
  div.className =
    "h-48 p-3 bg-custom-800 rounded-xl shadow hover:bg-custom-300 transition cursor-pointer justify-center flex flex-col items-center opacity-0";

  const img = document.createElement("img");
  img.src = `../resources/icons/${cat.icona}.svg`;
  img.alt = cat.nome;
  img.className = "w-12 h-12 mb-4 text-white";

  const label = document.createElement("div");
  label.className = "font-inconsolata text-2xl";
  label.textContent = cat.nome.toUpperCase();

  div.appendChild(img);
  div.appendChild(label);

  div.classList.add("opacity-0", "transition-opacity", "duration-300");
  container.appendChild(div);

  if (cat.enabled) {
    div.addEventListener("click", () => {
      sessionStorage.setItem("categoriaSelezionata", cat.nome.toLowerCase());
      div.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "menu.html";
      }, 400);
    });
  } else {
    div.classList.remove("hover:bg-custom-300");
    div.classList.add("hover:cursor-not-allowed");
    div.classList.add("bg-custom-950");
  }

  setTimeout(() => {
    div.classList.remove("opacity-0");
    div.classList.add("fade-in-6");
  }, index * 180);
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "index.html";
});
