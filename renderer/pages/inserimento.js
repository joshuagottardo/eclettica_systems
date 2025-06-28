// --- GESTIONE DROPZONE IMMAGINI ---
const immagini = {}; // { tipo: File }

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.image-drop').forEach(dropZone => {
    const tipo = dropZone.dataset.id;
    const originalText = dropZone.innerHTML;

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('ring-2', 'ring-blue-500');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('ring-2', 'ring-blue-500');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('ring-2', 'ring-blue-500');

      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) {
        alert("Trascina un'immagine valida.");
        return;
      }

      immagini[tipo] = file; // Salva il file per questo tipo

      const reader = new FileReader();
      reader.onload = (event) => {
        dropZone.innerHTML = `
          <img src="${event.target.result}" class="object-cover w-full h-full rounded opacity-100 hover:opacity-60 transition-opacity" />
          <button class="delete-btn absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700">Elimina</button>
        `;
        const deleteBtn = dropZone.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropZone.innerHTML = originalText;
          delete immagini[tipo];
        });
      };
      reader.readAsDataURL(file);
    });
  });
});

// --- CARICAMENTO MATERIALI ---
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#materiali-container");
  if (!container) return;
  try {
    const response = await fetch("/api/materiali");
    if (!response.ok) throw new Error(`Errore HTTP ${response.status}`);
    const materiali = await response.json();
    if (!Array.isArray(materiali)) throw new Error("Risposta non valida dal server");
    materiali.forEach(materiale => {
      const nomeOriginale = materiale.nome;
      const nomeFormattato = nomeOriginale.replace(/_/g, " ");
      const label = document.createElement("label");
      label.className = "cursor-pointer";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "materiale";
      input.value = materiale.id; // USA L'ID
      input.className = "peer hidden";
      const pill = document.createElement("div");
      pill.className = "px-4 py-2 rounded-full border border-custom-100 text-neutral-600 peer-checked:bg-custom-300 peer-checked:text-white transition peer-hover:text-white transition";
      pill.textContent = nomeFormattato;
      label.appendChild(input);
      label.appendChild(pill);
      container.appendChild(label);
    });
  } catch (error) {
    console.error("Errore durante il caricamento dei materiali:", error);
    container.innerHTML = `<p class="text-red-500">Errore: ${error.message}</p>`;
  }
});

// --- RACCOLTA DATI E INVIO FORM ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('button[type="submit"]').addEventListener("click", async (e) => {
    e.preventDefault();

    // Sezioni/campi
    const section = document.querySelector("main section"); // sinistra
    const campi = section.querySelectorAll("input, select");
    // Index mapping come da tuo HTML
    const [
      inputNome,    // 0
      selectTipo,   // 1
      inputPezzi,   // 2
      ,             // 3 (vuoto, divider)
      ,             // 4 (vuoto, divider)
      inputAltezza, // 5
      selectPunta,  // 6
      selectTacco,  // 7
      ,             // 8 (vuoto, divider)
      inputAccessori, // 9
      ,             // 10 (vuoto, divider)
      selectAzienda // 11
    ] = campi;

    // Materiali selezionati (ID)
    const materiali = Array.from(document.querySelectorAll('input[name="materiale"]:checked')).map(cb => cb.value);

    // Validazione base (puoi aggiungere altro)
    if (!inputNome.value.trim()) {
      alert("Il campo nome è obbligatorio");
      inputNome.focus();
      return;
    }

    // Prepara FormData (serve per i file)
    const formData = new FormData();
    formData.append("nome", inputNome.value.trim());
    formData.append("tipo", selectTipo.value);
    formData.append("numero_pezzi", inputPezzi.value);
    formData.append("altezza", inputAltezza.value);
    formData.append("punta", selectPunta.value);
    formData.append("tacco", selectTacco.value);
    formData.append("accessori", inputAccessori.value.trim());
    formData.append("azienda", selectAzienda.value);
    materiali.forEach(idMat => formData.append("materiali[]", idMat));

    // Immagini (solo quelle effettivamente caricate)
    Object.entries(immagini).forEach(([tipo, file]) => {
      if (file) formData.append(`immagine_${tipo}`, file);
    });

    try {
      const res = await fetch("/api/articoli", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Errore nell'invio dati!");
      // Success feedback
      alert("Articolo inserito con successo!");
      window.location.href = "/ricerca.html";
    } catch (err) {
      alert("Errore durante l'inserimento: " + err.message);
    }
  });
});
