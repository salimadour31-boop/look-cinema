// Look Cinema - Outil de looks cinématiques
// Tout le traitement se fait localement dans le navigateur.

const i18n = {
  fr: {
    title: "Look Cinema",
    upload: "Charger une image",
    look: "Look cinématique",
    strength: "Intensité",
    apply: "Appliquer",
    export: "Exporter PNG",
    status: "Chargez une image pour commencer.",
    statusReady: "Image chargée. Choisissez un look.",
    footer: "Outil gratuit open source — rien n'est envoyé. Licence MIT.",
    none: "Aucun",
    teal: "Teal & Orange",
    noir: "Noir",
    vintage: "Vintage chaud",
    scifi: "Sci-Fi froid",
    pastel: "Pastel",
    bleach: "Bleach Bypass"
  },
  en: {
    title: "Look Cinema",
    upload: "Load an image",
    look: "Cinematic look",
    strength: "Strength",
    apply: "Apply",
    export: "Export PNG",
    status: "Load an image to start.",
    statusReady: "Image loaded. Choose a look.",
    footer: "Free open source tool — nothing is uploaded. MIT License.",
    none: "None",
    teal: "Teal & Orange",
    noir: "Noir",
    vintage: "Warm Vintage",
    scifi: "Cool Sci-Fi",
    pastel: "Pastel",
    bleach: "Bleach Bypass"
  },
  kab: {
    title: "Look Cinema",
    upload: "Sali tugna",
    look: "Ameskan n sinima",
    strength: "Tazmert",
    apply: "Snes",
    export: "Suffeɣ PNG",
    status: "Sali tugna akken ad tebduḍ.",
    statusReady: "Tugna yettwasali. Fren ameskan.",
    footer: "Allal ilelli — ulac ayen yettwazen. Tasɣent MIT.",
    none: "Ulac",
    teal: "Teal & Orange",
    noir: "Noir",
    vintage: "Vintage ḥmu",
    scifi: "Sci-Fi aṣemmaḍ",
    pastel: "Pastel",
    bleach: "Bleach Bypass"
  }
};

let currentLang = "fr";
let originalImageData = null;
let currentImage = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fileInput = document.getElementById("file-input");
const lookSelect = document.getElementById("look-select");
const strengthSlider = document.getElementById("strength");
const applyBtn = document.getElementById("apply-btn");
const exportBtn = document.getElementById("export-btn");
const statusEl = document.getElementById("status");

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "kab" ? "kab" : lang;
  const t = i18n[lang];
  document.getElementById("title").textContent = t.title;
  document.getElementById("upload-label").textContent = t.upload;
  document.getElementById("look-label").textContent = t.look;
  document.getElementById("strength-label").textContent = t.strength;
  applyBtn.textContent = t.apply;
  exportBtn.textContent = t.export;
  document.getElementById("footer-text").textContent = t.footer;
  statusEl.textContent = originalImageData ? t.statusReady : t.status;
  // Update select options
  lookSelect.options[0].text = t.none;
  lookSelect.options[1].text = t.teal;
  lookSelect.options[2].text = t.noir;
  lookSelect.options[3].text = t.vintage;
  lookSelect.options[4].text = t.scifi;
  lookSelect.options[5].text = t.pastel;
  lookSelect.options[6].text = t.bleach;
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    // Fit canvas to reasonable size
    const maxW = 1200;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    statusEl.textContent = i18n[currentLang].statusReady;
    exportBtn.disabled = false;
    applyLook();
  };
  img.src = URL.createObjectURL(file);
});

applyBtn.addEventListener("click", applyLook);
lookSelect.addEventListener("change", applyLook);
strengthSlider.addEventListener("input", applyLook);

function applyLook() {
  if (!originalImageData) return;
  const look = lookSelect.value;
  const strength = strengthSlider.value / 100;
  const data = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    originalImageData.width,
    originalImageData.height
  );
  const pixels = data.data;
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    if (look === "teal-orange") {
      // Push shadows to teal, highlights to orange
      const lum = (r + g + b) / 3;
      if (lum < 128) {
        r = r * (1 - strength * 0.3);
        b = Math.min(255, b + strength * 40);
        g = g * (1 - strength * 0.1);
      } else {
        r = Math.min(255, r + strength * 30);
        g = g * (1 - strength * 0.15);
        b = b * (1 - strength * 0.4);
      }
    } else if (look === "noir") {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const contrast = 1 + strength * 0.8;
      const n = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
      r = g = b = n;
    } else if (look === "vintage") {
      r = Math.min(255, r + strength * 25);
      g = g * (1 - strength * 0.1);
      b = b * (1 - strength * 0.25);
      // slight fade
      r = r * (1 - strength * 0.1) + 20 * strength;
      g = g * (1 - strength * 0.1) + 15 * strength;
      b = b * (1 - strength * 0.1) + 10 * strength;
    } else if (look === "scifi") {
      r = r * (1 - strength * 0.3);
      g = g * (1 - strength * 0.1);
      b = Math.min(255, b + strength * 40);
    } else if (look === "pastel") {
      r = r * (1 - strength * 0.3) + 180 * strength;
      g = g * (1 - strength * 0.3) + 160 * strength;
      b = b * (1 - strength * 0.3) + 200 * strength;
    } else if (look === "bleach") {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = r * (1 - strength) + gray * strength * 1.2;
      g = g * (1 - strength) + gray * strength * 1.1;
      b = b * (1 - strength) + gray * strength * 0.9;
      // boost contrast
      const c = 1 + strength * 0.5;
      r = Math.min(255, Math.max(0, (r - 128) * c + 128));
      g = Math.min(255, Math.max(0, (g - 128) * c + 128));
      b = Math.min(255, Math.max(0, (b - 128) * c + 128));
    }
    pixels[i] = Math.min(255, Math.max(0, r));
    pixels[i+1] = Math.min(255, Math.max(0, g));
    pixels[i+2] = Math.min(255, Math.max(0, b));
  }
  ctx.putImageData(data, 0, 0);
}

exportBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "look-cinema.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Init
setLang("fr");