/**
 * MathQuill WYSIWYG equation editor + symbol palette.
 */
const EquationEditor = (() => {
  let mathField = null;
  let insertMode = 'inline'; // 'inline' or 'block'

  const SYMBOL_CATEGORIES = {
    'Greek': [
      { label: '\u03B1', latex: '\\alpha',   title: 'alpha' },
      { label: '\u03B2', latex: '\\beta',    title: 'beta' },
      { label: '\u03B3', latex: '\\gamma',   title: 'gamma' },
      { label: '\u03B4', latex: '\\delta',   title: 'delta' },
      { label: '\u03B5', latex: '\\epsilon', title: 'epsilon' },
      { label: '\u03B6', latex: '\\zeta',    title: 'zeta' },
      { label: '\u03B7', latex: '\\eta',     title: 'eta' },
      { label: '\u03B8', latex: '\\theta',   title: 'theta' },
      { label: '\u03BB', latex: '\\lambda',  title: 'lambda' },
      { label: '\u03BC', latex: '\\mu',      title: 'mu' },
      { label: '\u03BD', latex: '\\nu',      title: 'nu' },
      { label: '\u03C0', latex: '\\pi',      title: 'pi' },
      { label: '\u03C1', latex: '\\rho',     title: 'rho' },
      { label: '\u03C3', latex: '\\sigma',   title: 'sigma' },
      { label: '\u03C4', latex: '\\tau',     title: 'tau' },
      { label: '\u03C6', latex: '\\phi',     title: 'phi' },
      { label: '\u03C8', latex: '\\psi',     title: 'psi' },
      { label: '\u03C9', latex: '\\omega',   title: 'omega' },
      { label: '\u0393', latex: '\\Gamma',   title: 'Gamma' },
      { label: '\u0394', latex: '\\Delta',   title: 'Delta' },
      { label: '\u03A3', latex: '\\Sigma',   title: 'Sigma' },
      { label: '\u03A9', latex: '\\Omega',   title: 'Omega' },
    ],
    'Operators': [
      { label: '\u222B', latex: '\\int',     title: 'integral' },
      { label: '\u222C', latex: '\\iint',    title: 'double integral' },
      { label: '\u2211', latex: '\\sum',     title: 'sum' },
      { label: '\u220F', latex: '\\prod',    title: 'product' },
      { label: '\u2202', latex: '\\partial', title: 'partial' },
      { label: '\u221E', latex: '\\infty',   title: 'infinity' },
      { label: '\u00B1', latex: '\\pm',      title: 'plus-minus' },
      { label: '\u00D7', latex: '\\times',   title: 'times' },
      { label: '\u00F7', latex: '\\div',     title: 'divide' },
      { label: '\u2207', latex: '\\nabla',   title: 'nabla' },
      { label: '\u221A', latex: '\\sqrt{}',  title: 'square root' },
    ],
    'Relations': [
      { label: '\u2264', latex: '\\leq',     title: 'less or equal' },
      { label: '\u2265', latex: '\\geq',     title: 'greater or equal' },
      { label: '\u2260', latex: '\\neq',     title: 'not equal' },
      { label: '\u2248', latex: '\\approx',  title: 'approximately' },
      { label: '\u221D', latex: '\\propto',  title: 'proportional' },
      { label: '\u2261', latex: '\\equiv',   title: 'equivalent' },
      { label: '\u2208', latex: '\\in',      title: 'element of' },
      { label: '\u2282', latex: '\\subset',  title: 'subset' },
      { label: '\u222A', latex: '\\cup',     title: 'union' },
      { label: '\u2229', latex: '\\cap',     title: 'intersection' },
      { label: '\u2192', latex: '\\rightarrow', title: 'right arrow' },
      { label: '\u21D2', latex: '\\Rightarrow', title: 'implies' },
    ],
    'Structures': [
      { label: 'a/b',  latex: '\\frac{}{}',   title: 'fraction' },
      { label: 'x\u00B2',  latex: '^{}',      title: 'superscript' },
      { label: 'x\u2082',  latex: '_{}',      title: 'subscript' },
      { label: '\u221A',   latex: '\\sqrt{}',  title: 'square root' },
      { label: '\u00B3\u221A', latex: '\\sqrt[3]{}', title: 'cube root' },
      { label: 'lim',  latex: '\\lim_{}',     title: 'limit' },
      { label: '\u222B\u2080\u00B9', latex: '\\int_{}^{}', title: 'definite integral' },
      { label: '\u2211\u2080\u207F', latex: '\\sum_{}^{}', title: 'summation with limits' },
      { label: '(a b)', latex: '\\begin{pmatrix}  &  \\\\  &  \\end{pmatrix}', title: 'matrix' },
      { label: 'f(x)', latex: 'f(x) = ', title: 'function' },
    ],
  };

  function buildSymbolPalette() {
    const palette = document.getElementById('symbol-palette');
    if (!palette) return;

    palette.innerHTML = '';

    for (const [category, symbols] of Object.entries(SYMBOL_CATEGORIES)) {
      const catDiv = document.createElement('div');
      catDiv.className = 'symbol-category';

      const heading = document.createElement('h4');
      heading.textContent = category;
      catDiv.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'symbol-grid';

      symbols.forEach(sym => {
        const btn = document.createElement('button');
        btn.className = 'symbol-btn';
        btn.textContent = sym.label;
        btn.title = sym.title;
        btn.setAttribute('data-latex', sym.latex);
        btn.type = 'button';
        grid.appendChild(btn);
      });

      catDiv.appendChild(grid);
      palette.appendChild(catDiv);
    }

    // Event delegation for symbol clicks
    palette.addEventListener('click', (e) => {
      const btn = e.target.closest('.symbol-btn');
      if (!btn || !mathField) return;
      const latex = btn.getAttribute('data-latex');
      mathField.write(latex);
      mathField.focus();
    });
  }

  function insertEquation() {
    if (!mathField) return;

    const latex = mathField.latex();
    if (!latex.trim()) return;

    const textarea = document.getElementById('text-input');
    let text;
    if (insertMode === 'block') {
      text = '\n$$' + latex + '$$\n';
    } else {
      text = '$' + latex + '$';
    }

    Utils.insertAtCursor(textarea, text);
    mathField.latex('');
    mathField.focus();
  }

  function init() {
    // Initialize MathQuill
    const mqField = document.getElementById('mathquill-field');
    if (!mqField || typeof MathQuill === 'undefined') {
      console.warn('MathQuill not available');
      return;
    }

    const MQ = MathQuill.getInterface(2);
    mathField = MQ.MathField(mqField, {
      spaceBehavesLikeTab: true,
      handlers: {
        edit: function () {
          const preview = document.getElementById('latex-preview');
          if (preview) {
            preview.textContent = mathField.latex();
          }
        }
      }
    });

    // Build symbol palette
    buildSymbolPalette();

    // Toggle equation editor visibility
    const toggleBtn = document.getElementById('toggle-equation-editor');
    const panel = document.getElementById('equation-editor-panel');
    if (toggleBtn && panel) {
      toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
          mathField.focus();
        }
      });
    }

    // Close button
    const closeBtn = document.getElementById('close-equation-editor');
    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
      });
    }

    // Insert button
    const insertBtn = document.getElementById('insert-equation');
    if (insertBtn) {
      insertBtn.addEventListener('click', insertEquation);
    }

    // Insert mode toggle (inline / block)
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        insertMode = btn.getAttribute('data-mode');
      });
    });
  }

  return { init };
})();
