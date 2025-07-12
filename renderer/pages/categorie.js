import { categorie } from "../globals.js";

const container = document.getElementById("grigliaCategorie");

categorie.forEach((cat) => {
  const div = document.createElement("div");
  div.className =
    "h-32 p-6 bg-custom-800 rounded-xl shadow hover:bg-custom-300 transition cursor-pointer justify-center flex flex-col items-center";
  div.innerHTML = `<span class="material-symbols-outlined text-4xl mb-5 block">${
    cat.icona
  }</span><div class="font-inconsolata text-2xl">${cat.nome.toUpperCase()}</div>`;

  div.addEventListener("click", () => {
    sessionStorage.setItem("categoriaSelezionata", cat.nome.toLowerCase());
    div.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "menu.html";
    }, 500);
  });

  div.classList.add("fade-in");

  container.appendChild(div);
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "index.html";
});
