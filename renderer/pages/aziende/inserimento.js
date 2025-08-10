function mostraPopup(titolo, callback) {
  const overlay = document.getElementById("popupOverlay");
  const input = document.getElementById("popupInput");
  const errore = document.getElementById("popupErrore");
  document.getElementById("popupTitle").textContent = titolo;
  input.value = "";
  errore.classList.add("hidden");

  overlay.classList.remove("hidden");

  const annulla = () => {
    overlay.classList.add("hidden");
    conferma.removeEventListener("click", confermaHandler);
    annullaBtn.removeEventListener("click", annulla);
  };

  const confermaHandler = async () => {
    const valore = input.value.trim();
    if (!valore) return;

    const erroreMessaggio = await callback(valore);
    if (erroreMessaggio) {
      errore.textContent = erroreMessaggio;
      errore.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      conferma.removeEventListener("click", confermaHandler);
      annullaBtn.removeEventListener("click", annulla);
    }
  };
}