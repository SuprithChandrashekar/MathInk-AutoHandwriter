/**
 * Dark mode toggle with localStorage persistence.
 */
const DarkMode = (() => {
  function init() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
    }

    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
      updateButtonText(toggleBtn);
    }
  }

  function toggle() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    AppState.darkMode = isDark;

    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) updateButtonText(toggleBtn);
  }

  function updateButtonText(btn) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.textContent = isDark ? 'Light' : 'Dark';
  }

  return { init, toggle };
})();
