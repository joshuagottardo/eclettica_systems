import { aree_di_lavoro } from "../globals.js";

aree_di_lavoro.forEach((cat, index) => {
  const div = document.createElement("div");
  div.className =
    "h-20 lg:h-24 p-2 bg-custom-800 rounded-lg shadow hover:bg-custom-300 transition cursor-pointer flex flex-col items-center justify-center opacity-0";

  const img = document.createElement("img");
  img.src = `../resources/icons/${cat.icona}.svg`;
  img.alt = cat.display;
  img.className = "w-5 lg:w-6 h-5 lg:h-6 mb-1";

  const label = document.createElement("div");
  label.className = "text-sm lg:text-xl text-center font-inconsolata";
  label.textContent = cat.display.toUpperCase();

  div.appendChild(img);
  div.appendChild(label);

  div.classList.add("opacity-0", "transition-opacity", "duration-300");

  const container = document.getElementById(`categoria${cat.categoria}`);
  container?.appendChild(div);

  if (cat.enabled) {
    div.addEventListener("click", () => {
      sessionStorage.setItem("categoriaSelezionata", cat.nome.toLowerCase());
      sessionStorage.setItem("displayCategoriaSelezionata", cat.display.toLowerCase());
      window.location.href = "menu.html";
    });
  } else {
    div.classList.remove("hover:bg-custom-300");
    div.classList.add("hover:cursor-not-allowed", "bg-custom-950");
  }

  setTimeout(() => {
    div.classList.remove("opacity-0");
    div.classList.add("fade-in-6");
  }, index * 80);
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "index.html";
});
