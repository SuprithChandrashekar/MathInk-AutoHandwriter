/**
 * Live preview with debounced updates.
 */
const Preview = (() => {
  let updateScheduled = null;
  let isUpdating = false;

  /**
   * Schedule a debounced preview update (500ms).
   */
  function scheduleUpdate() {
    if (updateScheduled) clearTimeout(updateScheduled);
    updateScheduled = setTimeout(() => {
      updatePreview();
    }, 500);
  }

  /**
   * Force an immediate preview update.
   */
  async function updatePreview() {
    if (isUpdating) return;
    isUpdating = true;

    try {
      const rawText = document.getElementById('text-input').value;
      const html = MarkdownParser.parseContent(rawText, AppState.embeddedImages);

      if (!html) {
        const container = document.getElementById('pages-container');
        container.innerHTML = '';
        // Show an empty page
        const emptyPage = PaperManager.createPageElement(AppState);
        container.appendChild(emptyPage);
        updatePageCount(1);
        return;
      }

      const pages = await Renderer.renderToPages(html, AppState, {
        applyRealism: true,
      });

      const container = document.getElementById('pages-container');
      container.innerHTML = '';

      pages.forEach(page => {
        container.appendChild(page);
      });

      updatePageCount(pages.length);
    } catch (err) {
      console.error('Preview update failed:', err);
    } finally {
      isUpdating = false;
    }
  }

  function updatePageCount(count) {
    const el = document.getElementById('page-count');
    if (el) {
      el.textContent = count === 1
        ? 'Page 1 of 1'
        : `${count} pages`;
    }
  }

  function init() {
    const textInput = document.getElementById('text-input');
    if (textInput) {
      textInput.addEventListener('input', scheduleUpdate);
    }

    // Show an empty page on load
    const container = document.getElementById('pages-container');
    if (container) {
      const emptyPage = PaperManager.createPageElement(AppState);
      container.appendChild(emptyPage);
    }
  }

  return { init, scheduleUpdate, updatePreview };
})();
