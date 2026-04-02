/**
 * Auto-pagination: split rendered content across page-sized chunks.
 */
const Pagination = (() => {
  /**
   * Measure the height of an element when placed in a container of given width.
   */
  function measureElementHeight(element, containerWidth) {
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.width = containerWidth + 'px';
    measureDiv.style.left = '-9999px';
    document.body.appendChild(measureDiv);

    const clone = element.cloneNode(true);
    measureDiv.appendChild(clone);
    const height = clone.offsetHeight;

    document.body.removeChild(measureDiv);
    return height;
  }

  /**
   * Split a block element at approximately the given height.
   * Returns { firstPart: Node|null, remainder: Node|null }.
   */
  function splitBlock(block, availableHeight, containerWidth) {
    // For non-text blocks (images, math), don't split
    if (block.tagName === 'IMG' || block.classList.contains('math-block')) {
      return { firstPart: null, remainder: block.cloneNode(true) };
    }

    if (block.tagName === 'PRE') {
      const clone = block.cloneNode(true);
      const codeNode = clone.querySelector('code');
      const text = codeNode ? codeNode.textContent : clone.textContent || '';
      const lines = text.split('\n');

      if (lines.length <= 1) {
        return { firstPart: null, remainder: block.cloneNode(true) };
      }

      let low = 0;
      let high = lines.length;

      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        const testBlock = block.cloneNode(true);
        const testCode = testBlock.querySelector('code');
        if (testCode) testCode.textContent = lines.slice(0, mid).join('\n');
        else testBlock.textContent = lines.slice(0, mid).join('\n');
        
        const h = measureElementHeight(testBlock, containerWidth);
        if (h <= availableHeight) {
          low = mid;
        } else {
          high = mid - 1;
        }
      }

      if (low === 0) return { firstPart: null, remainder: block.cloneNode(true) };

      const firstPart = block.cloneNode(true);
      const firstCode = firstPart.querySelector('code');
      if (firstCode) firstCode.textContent = lines.slice(0, low).join('\n');
      else firstPart.textContent = lines.slice(0, low).join('\n');

      const remainder = block.cloneNode(true);
      const remainderCode = remainder.querySelector('code');
      if (remainderCode) remainderCode.textContent = lines.slice(low).join('\n');
      else remainder.textContent = lines.slice(low).join('\n');

      return { firstPart, remainder };
    }

    // For text blocks, try to split at word boundaries
    const clone = block.cloneNode(true);
    const text = clone.textContent || '';
    const words = text.split(/\s+/);

    if (words.length <= 1) {
      return { firstPart: null, remainder: block.cloneNode(true) };
    }

    // Binary search for the split point
    let low = 0;
    let high = words.length;

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const testBlock = block.cloneNode(true);
      testBlock.textContent = words.slice(0, mid).join(' ');
      const h = measureElementHeight(testBlock, containerWidth);
      if (h <= availableHeight) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }

    if (low === 0) {
      return { firstPart: null, remainder: block.cloneNode(true) };
    }

    const firstPart = block.cloneNode(true);
    firstPart.textContent = words.slice(0, low).join(' ');

    const remainder = block.cloneNode(true);
    remainder.textContent = words.slice(low).join(' ');

    return { firstPart, remainder };
  }

  /**
   * Main pagination function.
   * Takes a container of rendered content and splits it into pages.
   *
   * @param {HTMLElement} contentContainer - The rendered content
   * @param {object} appState - AppState
   * @returns {HTMLElement[]} Array of .page elements
   */
  function paginate(contentContainer, appState) {
    const contentArea = PaperManager.getContentArea(appState.pageSize);
    const contentHeight = contentArea.height;
    const contentWidth = contentArea.width;

    const pages = [];
    let currentPage = PaperManager.createPageElement(appState);
    let currentContent = currentPage.querySelector('.page-content-area');

    // Copy font styles to page content area
    Renderer.applyFontStyles(currentContent, appState);

    let usedHeight = 0;

    // Get all block-level children
    const blocks = Array.from(contentContainer.children);

    if (blocks.length === 0) {
      // No content — return a single empty page
      pages.push(currentPage);
      return pages;
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockHeight = measureElementHeight(block, contentWidth);

      // Check for auto page break on code blocks
      let forceNewPage = false;
      if (usedHeight > 0) {
        if (block.tagName === 'PRE') {
          forceNewPage = true;
        } else if (appState.autoPageBreak && block.tagName.toLowerCase().match(/^h[1-6]$/)) {
          if (block.textContent.trim().toLowerCase().includes('problem')) {
            forceNewPage = true;
          }
        }
      }

      if (!forceNewPage && usedHeight + blockHeight <= contentHeight) {
        // Fits on current page
        currentContent.appendChild(block.cloneNode(true));
        usedHeight += blockHeight;
      } else {
        if (usedHeight > 0) {
          // Doesn't fit or forced new page - start a new page
          pages.push(currentPage);
          currentPage = PaperManager.createPageElement(appState);
          currentContent = currentPage.querySelector('.page-content-area');
          Renderer.applyFontStyles(currentContent, appState);
          usedHeight = 0;
        }

        // Now we are at the top of a page
        if (blockHeight <= contentHeight) {
          currentContent.appendChild(block.cloneNode(true));
          usedHeight = blockHeight;
        } else {
          // Single block taller than a page — split it
          let remaining = block;
          while (remaining) {
            const available = contentHeight - usedHeight;
            const { firstPart, remainder } = splitBlock(remaining, available, contentWidth);

            if (firstPart) {
              currentContent.appendChild(firstPart);
              usedHeight += measureElementHeight(firstPart, contentWidth);
            }

            if (remainder) {
              pages.push(currentPage);
              currentPage = PaperManager.createPageElement(appState);
              currentContent = currentPage.querySelector('.page-content-area');
              Renderer.applyFontStyles(currentContent, appState);
              usedHeight = 0;
              remaining = remainder;

              // Check if remainder fits on a new page
              const remHeight = measureElementHeight(remainder, contentWidth);
              if (remHeight <= contentHeight) {
                currentContent.appendChild(remainder.cloneNode(true));
                usedHeight = remHeight;
                remaining = null;
              }
            } else {
              remaining = null;
            }
          }
        }
      }
    }

    // Don't forget the last page
    pages.push(currentPage);

    return pages;
  }

  return { paginate, measureElementHeight, splitBlock };
})();
