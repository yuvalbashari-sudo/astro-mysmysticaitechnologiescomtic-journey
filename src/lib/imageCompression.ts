/**
 * Image compression utility — resizes and compresses images before sending to AI.
 * Reduces payload size and cost for vision-model calls (e.g. palm reading).
 */

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

/**
 * Compress a base64 data-URL image. Returns a smaller base64 data-URL (JPEG).
 */
export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if exceeds max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
