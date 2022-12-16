import Color from "@shared/types/color";
import Layer from "@shared/types/layer";

const addColors = (
  r1: number,
  g1: number,
  b1: number,
  a1: number,
  r2: number,
  g2: number,
  b2: number,
  a2: number
) => {
  const r = new Color(0, 0, 0, 0);

  r.a = 255 - (255 - a1) * (255 - a2);
  if (r.a <= 0) return r;
  r.r = (r1 * a1) / r.a + (r2 * a2 * (255 - a1)) / r.a;
  r.g = (g1 * a1) / r.a + (g2 * a2 * (255 - a1)) / r.a;
  r.b = (b1 * a1) / r.a + (b2 * a2 * (255 - a1)) / r.a;

  return r;
};

const layersToImageData = (
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  realWidth: number,
  layers: Layer[]
) => {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (const layer of layers) {
    if (!layer.visible) continue;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceIndex = offsetX + x + (offsetY + y) * realWidth;
        const targetIndex = x + y * width;

        const r1 = layer.pixels[sourceIndex * 4];
        const g1 = layer.pixels[sourceIndex * 4 + 1];
        const b1 = layer.pixels[sourceIndex * 4 + 2];
        const a1 = layer.pixels[sourceIndex * 4 + 3];

        const r2 = pixels[targetIndex * 4];
        const g2 = pixels[targetIndex * 4 + 1];
        const b2 = pixels[targetIndex * 4 + 2];
        const a2 = pixels[targetIndex * 4 + 3];

        const combined = addColors(r1, g1, b1, a1, r2, g2, b2, a2);

        pixels[targetIndex * 4] = combined.r;
        pixels[targetIndex * 4 + 1] = combined.g;
        pixels[targetIndex * 4 + 2] = combined.b;
        pixels[targetIndex * 4 + 3] = combined.a;
      }
    }

    // for (let i = 0; i < pixels.length / 4; i++) {
    //   const r1 = layer.pixels[i * 4];
    //   const g1 = layer.pixels[i * 4 + 1];
    //   const b1 = layer.pixels[i * 4 + 2];
    //   const a1 = layer.pixels[i * 4 + 3];

    //   const r2 = pixels[i * 4];
    //   const g2 = pixels[i * 4 + 1];
    //   const b2 = pixels[i * 4 + 2];
    //   const a2 = pixels[i * 4 + 3];

    //   const combined = addColors(r1, g1, b1, a1, r2, g2, b2, a2);

    //   pixels[i * 4] = combined.r;
    //   pixels[i * 4 + 1] = combined.g;
    //   pixels[i * 4 + 2] = combined.b;
    //   pixels[i * 4 + 3] = combined.a;
    // }
  }

  return new ImageData(pixels, width, height);
};

export default layersToImageData;
