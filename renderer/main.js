document.addEventListener("DOMContentLoaded", () => {
  const utenti = [
    "angelo", "simone", "andrea", "angelica", "antonio", "bruno",
    "daniela", "dora", "elena", "marianna", "martina", "paola",
    "paolo", "vera", "virginie", "amministratore"
  ];

  const audio = new Audio("resources/audio/benvenuti.mp3");
  audio.play().catch((err) => {
    console.warn("Errore nel riprodurre l'audio benvenuto:", err);
  });

  const grid = document.getElementById("utenti-grid");

  audio.addEventListener("ended", () => {
    document.getElementById("intro").classList.add("translate-up-100");

    utenti.forEach((nome, index) => {
      const div = document.createElement("div");
      div.className =
        "utente-item bg-custom-700 text-white p-5 rounded-lg text-center cursor-pointer opacity-0 scale-95 transition duration-500 ease-out";
      div.textContent = nome.toUpperCase();
      div.dataset.nome = nome;
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

      // Reset posizione saluto
      saluto.classList.remove("translate-up-40");
      saluto.classList.add("translate-start");

      requestAnimationFrame(() => {
        saluto.classList.remove("translate-start");
        saluto.classList.add("translate-up-40");
      });
    }, 500);

    const audioPath = `resources/audio/users/${nome}.mp3`;
    const audioUser = new Audio(audioPath);
    audioUser.play().catch((err) => {
      console.warn(`Errore nel riprodurre l'audio per ${nome}:`, err);
    });

    audioUser.addEventListener("ended", () => {
      const passwordInput = document.getElementById("password");
      const loginBtn = document.querySelector('#login-form button[type="submit"]');
      const cambiaUtenteBtn = document.getElementById("cambia-utente");

      // Mostra form solo dopo la transizione del saluto
      setTimeout(() => {
        [passwordInput, loginBtn, cambiaUtenteBtn].forEach((el) => {
          el.classList.remove("hidden");
          el.classList.add("fade-in");
        });
      }, 400);

      const audioPassword = new Audio("resources/audio/password.mp3");
      audioPassword.play().catch((err) => {
        console.warn("Errore nel riprodurre l'audio password:", err);
      });
    });
  });

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const loginBox = document.getElementById("login-box");
    const nome = loginBox.dataset.nome;
    const password = document.getElementById("password").value;

    if (password.toLowerCase() === nome.toLowerCase()) {
      localStorage.setItem("utente", nome);
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "/ricerca.html";
      }, 500);
    } else {
      alert("Password errata");
    }
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
    [passwordInput, loginBtn, cambiaUtenteBtn].forEach((el) => {
      el.classList.add("hidden");
    });

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
