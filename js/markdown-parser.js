/**
 * Markdown + LaTeX parsing pipeline.
 *
 * Pipeline: raw text → extractMath → marked.parse → restoreMath → processImages → HTML
 */
const MarkdownParser = (() => {
  /**
   * Extract math expressions and replace with placeholders.
   * Returns { text, mathMap } where mathMap is Map<placeholder, {latex, display}>.
   */
  function extractMath(text) {
    const mathMap = new Map();
    let counter = 0;

    // Block math: $$...$$  (must come first — greedy before inline)
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
      const placeholder = `%%MATH_BLOCK_${counter++}%%`;
      mathMap.set(placeholder, { latex: latex.trim(), display: true });
      return placeholder;
    });

    // Inline math: $...$  (single-line, non-greedy)
    text = text.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      const placeholder = `%%MATH_INLINE_${counter++}%%`;
      mathMap.set(placeholder, { latex: latex.trim(), display: false });
      return placeholder;
    });

    return { text, mathMap };
  }

  /**
   * Restore math placeholders with span/div elements containing data-latex.
   */
  function restoreMath(html, mathMap) {
    for (const [placeholder, { latex, display }] of mathMap) {
      const escaped = latex
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      let replacement;
      if (display) {
        replacement = `<div class="math-block" data-latex="${escaped}"></div>`;
      } else {
        replacement = `<span class="math-inline" data-latex="${escaped}"></span>`;
      }

      // The placeholder may be wrapped in <p> tags by marked
      html = html.replace(new RegExp(`<p>\\s*${escapeRegex(placeholder)}\\s*</p>`, 'g'), replacement);
      html = html.replace(new RegExp(escapeRegex(placeholder), 'g'), replacement);
    }
    return html;
  }

  /**
   * Replace image references ![alt](img-ID) with actual <img> tags.
   */
  function processImages(html, embeddedImages) {
    if (!embeddedImages || embeddedImages.length === 0) return html;

    for (const img of embeddedImages) {
      const pattern = new RegExp(
        `<img[^>]*src="${escapeRegex(img.id)}"[^>]*>`,
        'g'
      );
      const replacement = `<img class="embedded-image" src="${img.dataUrl}" alt="embedded image" style="max-width:100%;">`;
      html = html.replace(pattern, replacement);

      // Also handle raw markdown-style that marked may have converted
      const mdPattern = new RegExp(
        `<img[^>]*src="${escapeRegex(img.id)}"[^>]*/?>`,
        'g'
      );
      html = html.replace(mdPattern, replacement);
    }
    return html;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Main parsing function. Returns HTML string.
   */
  function parseContent(rawText, embeddedImages) {
    if (!rawText.trim()) return '';

    // Step 1: Extract math
    const { text, mathMap } = extractMath(rawText);

    // Step 2: Parse markdown
    let html = marked.parse(text);

    // Step 3: Restore math
    html = restoreMath(html, mathMap);

    // Step 4: Process embedded images
    html = processImages(html, embeddedImages);

    return html;
  }

  return { parseContent, extractMath, restoreMath };
})();
