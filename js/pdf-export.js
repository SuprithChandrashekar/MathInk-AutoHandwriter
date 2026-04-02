/**
 * PDF export: capture pages via html2canvas and bundle with jsPDF.
 */
const PdfExport = (() => {
  /**
   * Generate a multi-page PDF from the current content.
   */
  async function generatePDF() {
    const btn = document.getElementById('generate-pdf');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Generating...';
    }

    try {
      const rawText = document.getElementById('text-input').value;
      const html = MarkdownParser.parseContent(rawText, AppState.embeddedImages);

      if (!html) {
        alert('Nothing to export. Type some text first.');
        return;
      }

      // Render pages with full realism
      const pages = await Renderer.renderToPages(html, AppState, {
        applyRealism: true,
      });

      const dims = PaperManager.getPageDimensions(AppState.pageSize);

      // Create PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [dims.width, dims.height],
        hotfixes: ['px_scaling'],
      });

      const renderArea = document.getElementById('render-area');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        renderArea.innerHTML = '';
        renderArea.appendChild(page);

        // Ensure the page is visible for html2canvas
        renderArea.style.visibility = 'visible';

        // Capture with html2canvas
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: dims.width,
          height: dims.height,
        });

        // Apply canvas-level realism effects
        Realism.applyScannerNoise(canvas);
        Realism.applyPaperTexture(canvas);

        // Add to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        if (i > 0) {
          doc.addPage([dims.width, dims.height]);
        }

        doc.addImage(imgData, 'JPEG', 0, 0, dims.width, dims.height);
      }

      // Hide render area again
      renderArea.style.visibility = 'hidden';
      renderArea.innerHTML = '';

      // Download
      doc.save('handwritten-notes.pdf');

    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Check console for details.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'PDF';
      }
    }
  }

  function init() {
    const btn = document.getElementById('generate-pdf');
    if (btn) {
      btn.addEventListener('click', generatePDF);
    }
  }

  return { init, generatePDF };
})();
