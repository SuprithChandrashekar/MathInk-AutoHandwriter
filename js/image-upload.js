/**
 * Image embedding: upload images and insert them into notes.
 */
const ImageUpload = (() => {
  function init() {
    const uploadBtn = document.getElementById('upload-image-btn');
    const uploadInput = document.getElementById('image-upload');

    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', () => uploadInput.click());
      uploadInput.addEventListener('change', handleUpload);
    }
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const id = Utils.generateId();
      const img = new Image();
      img.onload = () => {
        AppState.embeddedImages.push({
          id,
          dataUrl: ev.target.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        const textarea = document.getElementById('text-input');
        Utils.insertAtCursor(textarea, `\n![image](${id})\n`);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be uploaded again
    e.target.value = '';
  }

  return { init };
})();
