// Turn an uploaded image File into a data URL suitable for a texture.
// Large photos are downscaled so a single texture can't blow the ~5 MB
// localStorage budget and silently break autosave (see saveLocal).

const MAX_EDGE = 1024;      // longest side, px
const KEEP_AS_IS = 350_000; // small images pass through untouched (bytes)

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read that file.'));
    r.readAsDataURL(file);
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file is not a readable image.'));
    img.src = url;
  });
}

export async function fileToTextureDataURL(file, { max = MAX_EDGE, quality = 0.85 } = {}) {
  const original = await readAsDataURL(file);
  const img = await loadImage(original);

  const longest = Math.max(img.width, img.height);
  const scale = Math.min(1, max / longest);

  // Small, already-modest images keep their exact bytes (and any transparency).
  if (scale === 1 && file.size <= KEEP_AS_IS) return original;

  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  // PNG sources may carry alpha (logos, grilles); keep PNG for them, else JPEG.
  const isPng = /^data:image\/png/i.test(original);
  return canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
}
