import jsQR from 'jsqr';
import { Box2D } from './types';

export interface DecodedQrResult {
  data: string;
  box2d?: Box2D;
}

/**
 * Scans an image (via HTMLImageElement or ImageData) for QR codes.
 * Returns decoded URL/text and normalized box2d if found.
 */
export async function scanQrCodeFromDataUrl(dataUrl: string): Promise<DecodedQrResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          // Normalize coordinates to 0-1000
          const loc = code.location;
          const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomRightCorner.x, loc.bottomLeftCorner.x];
          const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomRightCorner.y, loc.bottomLeftCorner.y];

          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const box2d: Box2D = [
            Math.round(Math.max(0, Math.min(1000, (minY / canvas.height) * 1000))),
            Math.round(Math.max(0, Math.min(1000, (minX / canvas.width) * 1000))),
            Math.round(Math.max(0, Math.min(1000, (maxY / canvas.height) * 1000))),
            Math.round(Math.max(0, Math.min(1000, (maxX / canvas.width) * 1000)))
          ];

          resolve({ data: code.data, box2d });
          return;
        }
      } catch (err) {
        console.warn('[QR Scanner] Error scanning image:', err);
      }
      resolve(null);
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
