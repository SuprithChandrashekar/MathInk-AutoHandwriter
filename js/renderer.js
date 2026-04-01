/**
 * DOM rendering engine.
 * Takes parsed HTML and renders it into styled page elements.
 */
const Renderer = (() => {
  /**
   * Apply font and ink styles to a container element based on AppState.
   */
  function applyFontStyles(element, state) {
    element.style.fontFamily = `'${state.font}', cursive`;
    element.style.fontSize = state.fontSize + 'px';
    element.style.color = state.inkColor;
    element.style.letterSpacing = state.letterSpacing + 'px';
    element.style.wordSpacing = state.wordSpacing + 'px';
    element.style.lineHeight = state.lineHeight;
  }

  /**
   * Populate math elements with LaTeX delimiters so MathJax can typeset them.
   */
  function prepareMathElements(container) {
    const mathEls = container.querySelectorAll('[data-latex]');
    mathEls.forEach(el => {
      const latex = el.getAttribute('data-latex');
      if (el.classList.contains('math-block')) {
        el.textContent = '\\[' + latex + '\\]';
      } else {
        el.textContent = '\\(' + latex + '\\)';
      }
    });
  }

  /**
   * Render math with MathJax and apply ink color to CHTML.
   */
  async function renderMath(container, inkColor) {
    if (!window.MathJax || !MathJax.typesetPromise) {
      // MathJax not loaded yet — skip
      return;
    }

    await MathJax.typesetPromise([container]);

    // Tint MathJax CHTML elements to match ink color
    const mathElements = container.querySelectorAll('mjx-container');
    mathElements.forEach(el => {
      el.style.color = inkColor;
    });
  }

  /**
   * Convert MathJax elements (CHTML or SVG) to <img> for reliable html2canvas capture.
   * Captures each mjx-container individually with html2canvas, then replaces it with an <img>.
   */
  async function convertMathToImg(container) {
    const mjxContainers = container.querySelectorAll('mjx-container');

    for (const mjx of mjxContainers) {
      try {
        // Check if it's SVG output first
        const svg = mjx.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });

          img.style.display = mjx.style.display || 'inline';
          img.style.verticalAlign = 'middle';
          img.style.width = svg.getAttribute('width') || 'auto';
          img.style.height = svg.getAttribute('height') || 'auto';

          mjx.parentNode.replaceChild(img, mjx);
          URL.revokeObjectURL(url);
          continue;
        }

        // CHTML output — capture with html2canvas
        const isBlock = mjx.getAttribute('display') === 'true' ||
                        window.getComputedStyle(mjx).display === 'block';

        // Capture the mjx-container as a small canvas
        const mathCanvas = await html2canvas(mjx, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
        });

        const imgDataUrl = mathCanvas.toDataURL('image/png');
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgDataUrl;
        });

        // Preserve the rendered dimensions (at 1x, since canvas was 2x)
        img.style.width = (mathCanvas.width / 2) + 'px';
        img.style.height = (mathCanvas.height / 2) + 'px';
        img.style.display = isBlock ? 'block' : 'inline';
        img.style.verticalAlign = 'middle';
        if (isBlock) {
          img.style.margin = '0.6em auto';
        }

        mjx.parentNode.replaceChild(img, mjx);
      } catch (err) {
        console.warn('Failed to convert MathJax element to img:', err);
      }
    }
  }

  /**
   * Main render function.
   * Renders parsed HTML into an array of page DOM elements.
   *
   * @param {string} html - Parsed HTML from MarkdownParser
   * @param {object} state - AppState
   * @param {object} options - { applyRealism: boolean }
   * @returns {Promise<HTMLElement[]>} Array of .page elements
   */
  async function renderToPages(html, state, options = {}) {
    const { applyRealism = true } = options;

    const renderArea = document.getElementById('render-area');
    renderArea.innerHTML = '';

    // Create a temporary container with all content
    const container = document.createElement('div');
    container.className = 'render-content';
    container.innerHTML = html;
    applyFontStyles(container, state);

    // Prepare math elements
    prepareMathElements(container);

    // Insert into render area for measurement
    renderArea.appendChild(container);

    // Render math
    await renderMath(container, state.inkColor);

    // Apply realism effects (skip for performance if not needed)
    if (applyRealism) {
      Realism.applyEffects(container);
    }

    // Paginate
    const pages = Pagination.paginate(container, state);

    // Clean up
    renderArea.innerHTML = '';

    return pages;
  }

  return {
    renderToPages,
    applyFontStyles,
    renderMath,
    convertMathToImg,
    prepareMathElements,
  };
})();
