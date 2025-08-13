const API = import.meta.env.VITE_API_BASE || "";

let utenti = [];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("utenti-grid");

  // carica utenti e, appena pronti, mostra la griglia (prima lo facevi al termine dell'audio)
  recuperaUtenti().then(() => {
    document.getElementById("intro").classList.add("translate-up-100");

    utenti.forEach((utente, index) => {
      const div = document.createElement("div");
      div.className =
        "utente-item bg-custom-700 text-white text-m p-5 rounded text-center cursor-pointer opacity-0 scale-95 transition duration-500 ease-out";
      div.textContent = utente.nome.toUpperCase();
      div.dataset.nome = utente.nome;
      div.dataset.id = utente.id;
      grid.appendChild(div);

      setTimeout(() => {
        div.classList.add("fade-in");
      }, index * 100);
    });
  });

  grid.addEventListener("click", (e) => {
    const div = e.target.closest(".utente-item");
    if (!div) return;

    const nome = div.dataset.nome;
    const benvenuto = document.getElementById("benvenuto");
    const gridUtenti = document.getElementById("utenti-grid");
    const loginBox = document.getElementById("login-box");
    loginBox.dataset.id = div.dataset.id;
    const saluto = document.getElementById("saluto");

    benvenuto.classList.add("fade-out");
    gridUtenti.classList.add("fade-out");

    setTimeout(() => {
      benvenuto.style.display = "none";
      gridUtenti.style.display = "none";

      loginBox.classList.remove("hidden");
      loginBox.classList.add("fade-in");

      saluto.textContent = `CIAO ${nome.toUpperCase()}`;
      loginBox.dataset.nome = nome;

      // Reset posizione saluto + animazione
      saluto.classList.remove("translate-up-40");
      saluto.classList.add("translate-start");

      requestAnimationFrame(() => {
        saluto.classList.remove("translate-start");
        saluto.classList.add("translate-up-40");
      });
    }, 500);

    // Prima mostravi i campi alla fine degli audio; ora usiamo un semplice delay coerente con l’animazione
    setTimeout(() => {
      const passwordInput = document.getElementById("password");
      const loginBtn = document.querySelector('#login-form button[type="submit"]');
      const cambiaUtenteBtn = document.getElementById("cambia-utente");
      [passwordInput, loginBtn, cambiaUtenteBtn].forEach((el) => {
        el.classList.remove("hidden");
        el.classList.add("fade-in");
      });
    }, 900); // 500ms (switch) + ~400ms (anim saluto)
  });

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const loginBox = document.getElementById("login-box");
    const nome = loginBox.dataset.nome;
    const id = parseInt(loginBox.dataset.id, 10);
    const password = document.getElementById("password").value;

    if (isNaN(id)) {
      alert("Errore interno: ID utente non valido");
      return;
    }

    verificaPassword(id, password).then((valida) => {
      if (valida) {
        sessionStorage.setItem("utente_id", id);
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "/aree.html";
        }, 500);
      } else {
        alert("Password errata");
      }
    });
  });
});

document.getElementById("cambia-utente").addEventListener("click", () => {
  const loginBox = document.getElementById("login-box");
  const benvenuto = document.getElementById("benvenuto");
  const gridUtenti = document.getElementById("utenti-grid");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.querySelector('#login-form button[type="submit"]');
  const cambiaUtenteBtn = document.getElementById("cambia-utente");
  const saluto = document.getElementById("saluto");

  loginBox.classList.add("fade-out");

  setTimeout(() => {
    [passwordInput, loginBtn, cambiaUtenteBtn].forEach((el) => el.classList.add("hidden"));

    loginBox.classList.add("hidden");
    loginBox.classList.remove("fade-out");

    saluto.classList.remove("translate-up-40");
    saluto.classList.add("translate-start");

    benvenuto.style.display = "";
    gridUtenti.style.display = "";

    benvenuto.classList.remove("fade-out");
    gridUtenti.classList.remove("fade-out");

    benvenuto.classList.add("fade-in");
    gridUtenti.classList.add("fade-in");

    document.getElementById("password").value = "";
  }, 300);
});

async function recuperaUtenti() {
  try {
    const res = await fetch(`${API}/api/utenti`);
    utenti = await res.json(); // [{ id, nome }]
    console.log("Utenti recuperati:", utenti);
  } catch (err) {
    console.error("Errore nel recuperare utenti dal server:", err);
  }
}

async function verificaPassword(id, password) {
  try {
    const res = await fetch(`${API}/api/verifica-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valida === true;
  } catch (err) {
    console.error("Errore durante la verifica della password:", err);
    return false;
  }
}