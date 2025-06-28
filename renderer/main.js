document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('open-ricerca');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = 'ricerca.html';
    });
  }
});