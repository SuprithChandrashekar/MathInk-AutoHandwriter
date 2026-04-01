/**
 * Paper styles, page sizes, and background management.
 */
const PaperManager = (() => {
  const PAGE_SIZES = {
    a4:     { width: 794, height: 1123 },   // 210mm x 297mm at 96dpi
    letter: { width: 816, height: 1056 },   // 8.5" x 11" at 96dpi
  };

  const MARGINS = { top: 50, bottom: 40, left: 76, right: 30 };

  const PAPER_CLASSES = {
    ruled:  'paper-ruled',
    grid:   'paper-grid',
    dotted: 'paper-dotted',
    blank:  'paper-blank',
    custom: 'paper-custom',
  };

  function getPageDimensions(sizeKey) {
    return PAGE_SIZES[sizeKey] || PAGE_SIZES.a4;
  }

  function getContentArea(sizeKey) {
    const dims = getPageDimensions(sizeKey);
    return {
      width: dims.width - MARGINS.left - MARGINS.right,
      height: dims.height - MARGINS.top - MARGINS.bottom,
    };
  }

  /**
   * Create a page DOM element with correct size, paper style, and margins.
   */
  function createPageElement(appState) {
    const dims = getPageDimensions(appState.pageSize);
    const page = document.createElement('div');
    page.className = 'page ' + (PAPER_CLASSES[appState.paperStyle] || 'paper-ruled');
    page.style.width = dims.width + 'px';
    page.style.height = dims.height + 'px';

    if (appState.paperStyle === 'custom' && appState.customBackground) {
      page.style.backgroundImage = `url(${appState.customBackground})`;
    }

    const content = document.createElement('div');
    content.className = 'page-content-area';
    content.style.paddingTop = MARGINS.top + 'px';
    content.style.paddingBottom = MARGINS.bottom + 'px';
    content.style.paddingLeft = MARGINS.left + 'px';
    content.style.paddingRight = MARGINS.right + 'px';
    content.style.height = '100%';
    content.style.overflow = 'hidden';

    page.appendChild(content);
    return page;
  }

  function init() {
    const bgBtn = document.getElementById('bg-upload-btn');
    const bgInput = document.getElementById('bg-upload');

    if (bgBtn && bgInput) {
      bgBtn.addEventListener('click', () => bgInput.click());
      bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          AppState.customBackground = ev.target.result;
          AppState.paperStyle = 'custom';
          document.getElementById('paper-style').value = 'custom';
          Preview.scheduleUpdate();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  return {
    PAGE_SIZES,
    MARGINS,
    getPageDimensions,
    getContentArea,
    createPageElement,
    init,
  };
})();
