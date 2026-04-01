/**
 * Shared utility functions.
 */
const Utils = (() => {
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Box-Muller transform — returns a sample from N(mean, stddev). */
  function gaussianRandom(mean = 0, stddev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stddev;
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function generateId() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Math.random().toString(36).slice(2, 11);
  }

  /**
   * Load a custom font via the FontFace API.
   * Returns a Promise that resolves when the font is ready.
   */
  async function loadFontFace(name, url) {
    try {
      const font = new FontFace(name, `url(${url})`);
      const loaded = await font.load();
      document.fonts.add(loaded);
      return loaded;
    } catch (err) {
      console.warn(`Failed to load font "${name}" from ${url}:`, err);
      return null;
    }
  }

  /**
   * Insert text at the current cursor position in a textarea.
   */
  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + text + after;
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  /**
   * Wrap the selected text in a textarea with the given wrapper string.
   * e.g. wrapSelection(textarea, '**') turns "hello" into "**hello**"
   */
  function wrapSelection(textarea, wrapper) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const wrapped = wrapper + selected + wrapper;
    textarea.value = before + wrapped + after;
    textarea.selectionStart = start + wrapper.length;
    textarea.selectionEnd = end + wrapper.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  /**
   * Insert a prefix at the beginning of the current line in a textarea.
   */
  function insertLinePrefix(textarea, prefix) {
    const start = textarea.selectionStart;
    const val = textarea.value;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const before = val.substring(0, lineStart);
    const after = val.substring(lineStart);
    textarea.value = before + prefix + after;
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  return {
    debounce,
    gaussianRandom,
    clamp,
    generateId,
    loadFontFace,
    insertAtCursor,
    wrapSelection,
    insertLinePrefix,
  };
})();
