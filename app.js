/**
 * BlackLine – QR Code Generator
 * by Artheid Studio
 */
(function () {
  "use strict";

  const contentEl = document.getElementById("content");
  const fgColorEl = document.getElementById("fg-color");
  const bgColorEl = document.getElementById("bg-color");
  const fgHexEl = document.getElementById("fg-hex");
  const bgHexEl = document.getElementById("bg-hex");
  const sizeEl = document.getElementById("size");
  const sizeValueEl = document.getElementById("size-value");
  const eclEl = document.getElementById("ecl");
  const qrcodeEl = document.getElementById("qrcode");
  const statusEl = document.getElementById("status");
  const downloadBtn = document.getElementById("download-btn");
  const clearBtn = document.getElementById("clear-btn");
  const yearEl = document.getElementById("year");

  yearEl.textContent = new Date().getFullYear();

  // Map error correction levels
  const ECL_MAP = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H,
  };

  let qrInstance = null;
  let debounceTimer = null;

  function updateHexLabels() {
    fgHexEl.textContent = fgColorEl.value.toUpperCase();
    bgHexEl.textContent = bgColorEl.value.toUpperCase();
  }

  function clearQR() {
    qrcodeEl.innerHTML = "";
    qrInstance = null;
    downloadBtn.disabled = true;
    statusEl.textContent = "Type something to generate a QR code";
  }

  function generateQR() {
    const text = contentEl.value.trim();
    if (!text) {
      clearQR();
      return;
    }

    const size = parseInt(sizeEl.value, 10);
    const fg = fgColorEl.value;
    const bg = bgColorEl.value;
    const level = ECL_MAP[eclEl.value] || QRCode.CorrectLevel.M;

    // Clear previous
    qrcodeEl.innerHTML = "";

    try {
      qrInstance = new QRCode(qrcodeEl, {
        text: text,
        width: size,
        height: size,
        colorDark: fg,
        colorLight: bg,
        correctLevel: level,
      });

      // Ensure canvas/img is sized properly after generation
      const canvas = qrcodeEl.querySelector("canvas");
      const img = qrcodeEl.querySelector("img");
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "auto";
      }
      if (img) {
        img.style.width = "100%";
        img.style.height = "auto";
      }

      downloadBtn.disabled = false;
      statusEl.textContent = "QR code ready · Scan or download";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Could not generate QR code. Try shorter text.";
      downloadBtn.disabled = true;
    }
  }

  function scheduleGenerate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateQR, 120);
  }

  function downloadPNG() {
    if (!qrInstance) return;

    // Prefer canvas (higher quality), fallback to img
    let dataUrl = null;
    const canvas = qrcodeEl.querySelector("canvas");
    const img = qrcodeEl.querySelector("img");

    if (canvas) {
      dataUrl = canvas.toDataURL("image/png");
    } else if (img && img.src) {
      dataUrl = img.src;
    }

    if (!dataUrl) {
      statusEl.textContent = "Download failed – try again";
      return;
    }

    const link = document.createElement("a");
    link.download = "BlackLine-QR.png";
    link.href = dataUrl;
    link.click();
  }

  // Event listeners
  contentEl.addEventListener("input", scheduleGenerate);
  fgColorEl.addEventListener("input", () => {
    updateHexLabels();
    scheduleGenerate();
  });
  bgColorEl.addEventListener("input", () => {
    updateHexLabels();
    scheduleGenerate();
  });
  sizeEl.addEventListener("input", () => {
    sizeValueEl.textContent = sizeEl.value;
    sizeEl.setAttribute("aria-valuenow", sizeEl.value);
    scheduleGenerate();
  });
  eclEl.addEventListener("change", scheduleGenerate);

  downloadBtn.addEventListener("click", downloadPNG);
  clearBtn.addEventListener("click", () => {
    contentEl.value = "";
    clearQR();
    contentEl.focus();
  });

  // Initial state
  updateHexLabels();
  clearQR();
})();
