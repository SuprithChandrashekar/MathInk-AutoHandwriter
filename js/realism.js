/**
 * Handwriting realism effects.
 *
 * DOM-level effects (applied during render, visible in preview):
 *  - Character wrapping
 *  - Baseline wobble
 *  - Letter size variation
 *  - Ink density / pen pressure
 *  - Ink bleed
 *
 * Canvas-level effects (applied only during PDF export):
 *  - Scanner noise
 *  - Paper texture
 */
const Realism = (() => {
  /**
   * Walk text nodes and wrap each character in a <span class="hw-char">.
   * Skips math elements, MathJax output, and images.
   */
  function wrapCharacters(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent) continue;
      // Skip math and MathJax elements (including all mjx-* CHTML elements)
      if (parent.closest('.math-inline, .math-block, mjx-container, [data-latex]')) continue;
      if (parent.tagName && parent.tagName.toLowerCase().startsWith('mjx-')) continue;
      // Walk up to check if any ancestor is an mjx-* element
      let ancestor = parent;
      let insideMath = false;
      while (ancestor) {
        if (ancestor.tagName && ancestor.tagName.toLowerCase().startsWith('mjx-')) {
          insideMath = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (insideMath) continue;
      // Skip if already wrapped
      if (parent.classList && parent.classList.contains('hw-char')) continue;
      textNodes.push(node);
    }

    textNodes.forEach(node => {
      const text = node.textContent;
      if (!text) return;

      const fragment = document.createDocumentFragment();
      for (const char of text) {
        if (char === ' ' || char === '\n' || char === '\t') {
          fragment.appendChild(document.createTextNode(char));
        } else {
          const span = document.createElement('span');
          span.className = 'hw-char';
          span.textContent = char;
          span.style.display = 'inline-block';
          fragment.appendChild(span);
        }
      }
      node.parentNode.replaceChild(fragment, node);
    });
  }

  /**
   * Apply correlated baseline wobble to character spans.
   */
  function applyBaselineWobble(container) {
    const chars = container.querySelectorAll('.hw-char');
    let prev = 0;
    chars.forEach(span => {
      const raw = Utils.gaussianRandom(0, 0.6);
      const wobble = 0.7 * prev + 0.3 * raw;
      span.style.transform = `translateY(${wobble}px)`;
      prev = wobble;
    });
  }

  /**
   * Randomly vary letter sizes (0.96x to 1.04x).
   */
  function applyLetterSizeVariation(container) {
    const chars = container.querySelectorAll('.hw-char');
    chars.forEach(span => {
      const scale = 0.96 + Math.random() * 0.08;
      span.style.fontSize = (scale * 100).toFixed(1) + '%';
    });
  }

  /**
   * Vary ink opacity per character. Heavier at word starts.
   */
  function applyInkDensity(container) {
    const chars = container.querySelectorAll('.hw-char');
    let isWordStart = true;

    chars.forEach(span => {
      const base = isWordStart ? 0.93 : 0.83;
      const variation = Math.random() * 0.14;
      span.style.opacity = Utils.clamp(base + variation, 0.78, 1.0).toFixed(2);

      // Check if next sibling is a text node (space) → next char is word start
      const next = span.nextSibling;
      isWordStart = next && next.nodeType === Node.TEXT_NODE && /\s/.test(next.textContent);
    });
  }

  /**
   * Simulate pen pressure with subtle text-shadow intensity variation.
   */
  function applyPenPressure(container) {
    const chars = container.querySelectorAll('.hw-char');
    let isWordStart = true;

    chars.forEach(span => {
      const pressure = isWordStart ? 0.4 : 0.15 + Math.random() * 0.2;
      span.style.textShadow = `0 0 ${pressure}px currentColor`;

      const next = span.nextSibling;
      isWordStart = next && next.nodeType === Node.TEXT_NODE && /\s/.test(next.textContent);
    });
  }

  /**
   * Add subtle ink bleed effect to the container.
   */
  function applyInkBleed(container) {
    container.style.textShadow = '0 0 0.3px currentColor';
  }

  /**
   * Master function: apply all DOM-level realism effects.
   */
  function applyEffects(container) {
    wrapCharacters(container);
    applyBaselineWobble(container);
    applyLetterSizeVariation(container);
    applyInkDensity(container);
    applyPenPressure(container);
    applyInkBleed(container);
  }

  /**
   * Canvas post-processing: add Gaussian noise + slight rotation.
   */
  function applyScannerNoise(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Utils.gaussianRandom(0, 3);
      data[i]     = Utils.clamp(data[i] + noise, 0, 255);
      data[i + 1] = Utils.clamp(data[i + 1] + noise, 0, 255);
      data[i + 2] = Utils.clamp(data[i + 2] + noise, 0, 255);
    }
    ctx.putImageData(imageData, 0, 0);

    // Slight rotation for scanner misalignment
    const angle = (Math.random() - 0.5) * 0.006;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');
    tctx.translate(canvas.width / 2, canvas.height / 2);
    tctx.rotate(angle);
    tctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  /**
   * Canvas post-processing: overlay a subtle paper grain texture.
   */
  function applyPaperTexture(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Subtle grain texture
    for (let i = 0; i < data.length; i += 4) {
      const grain = Utils.gaussianRandom(0, 1.5);
      // Only apply to lighter pixels (paper, not ink)
      if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
        data[i]     = Utils.clamp(data[i] + grain, 0, 255);
        data[i + 1] = Utils.clamp(data[i + 1] + grain, 0, 255);
        data[i + 2] = Utils.clamp(data[i + 2] + grain, 0, 255);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return {
    applyEffects,
    applyScannerNoise,
    applyPaperTexture,
    wrapCharacters,
    applyBaselineWobble,
    applyLetterSizeVariation,
    applyInkDensity,
    applyPenPressure,
    applyInkBleed,
  };
})();
