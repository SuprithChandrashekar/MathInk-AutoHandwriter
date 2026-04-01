/**
 * Application entry point.
 * Manages global state, initializes all modules, and wires up events.
 */
const AppState = {
  text: '',
  font: 'QEBradenHill',
  fontSize: 18,
  inkColor: '#0000cc',
  letterSpacing: 1,
  wordSpacing: 3,
  lineHeight: 1.8,
  paperStyle: 'ruled',
  pageSize: 'a4',
  autoPageBreak: true,
  customBackground: null,
  darkMode: false,
  embeddedImages: [],
};

(async function init() {
  // Load QEBradenHill font
  await Utils.loadFontFace(
    'QEBradenHill',
    'fonts/QEBradenHill.ttf'
  );

  // Initialize all modules
  PaperManager.init();
  Preview.init();
  EquationEditor.init();
  ImageUpload.init();
  DarkMode.init();
  PdfExport.init();

  // Wire up toolbar controls
  wireToolbarEvents();

  // Trigger initial preview if there's default text
  Preview.scheduleUpdate();
})();

function wireToolbarEvents() {
  // Font selector
  bindSelect('font-select', (val) => {
    AppState.font = val;
    Preview.scheduleUpdate();
  });

  // Font size
  bindInput('font-size', (val) => {
    AppState.fontSize = parseInt(val, 10) || 18;
    Preview.scheduleUpdate();
  });

  // Ink color
  bindSelect('ink-color', (val) => {
    AppState.inkColor = val;
    Preview.scheduleUpdate();
  });

  // Paper style
  bindSelect('paper-style', (val) => {
    AppState.paperStyle = val;
    Preview.scheduleUpdate();
  });

  // Page size
  bindSelect('page-size', (val) => {
    AppState.pageSize = val;
    Preview.scheduleUpdate();
  });

  // Auto Page Break
  const autoPageBreakEl = document.getElementById('auto-page-break');
  if (autoPageBreakEl) {
    AppState.autoPageBreak = autoPageBreakEl.checked;
    autoPageBreakEl.addEventListener('change', (e) => {
      AppState.autoPageBreak = e.target.checked;
      Preview.scheduleUpdate();
    });
  }

  // Letter spacing
  bindRange('letter-spacing', (val) => {
    AppState.letterSpacing = parseFloat(val);
    Preview.scheduleUpdate();
  });

  // Word spacing
  bindRange('word-spacing', (val) => {
    AppState.wordSpacing = parseFloat(val);
    Preview.scheduleUpdate();
  });

  // Line height
  bindRange('line-height', (val) => {
    AppState.lineHeight = parseFloat(val);
    Preview.scheduleUpdate();
  });

  // Format toolbar buttons
  document.querySelectorAll('[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.getAttribute('data-insert');
      const textarea = document.getElementById('text-input');
      Utils.wrapSelection(textarea, wrapper);
    });
  });

  document.querySelectorAll('[data-insert-line]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.getAttribute('data-insert-line');
      const textarea = document.getElementById('text-input');
      Utils.insertLinePrefix(textarea, prefix);
    });
  });
}

function bindSelect(id, onChange) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', (e) => onChange(e.target.value));
}

function bindInput(id, onChange) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => onChange(e.target.value));
}

function bindRange(id, onChange) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => onChange(e.target.value));
}
