import { randomString } from "@shared/utils";

class Layer {
  id: string;

  width: number;
  height: number;

  pixels: Uint8ClampedArray;
  pixelsId: string;

  constructor(width: number, height: number) {
    this.id = randomString();

    this.width = width;
    this.height = height;

    this.pixels = new Uint8ClampedArray(50 * 50 * 4);
    this.pixels.fill(255);

    this.pixelsId = this.id;
  }

  getPixelIndex(x: number, y: number) {
    const index = x + y * this.width;
    if (index < 0 || index > this.pixels.length) return -1;

    return index * 4;
  }

  setPixelData(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ) {
    const index = this.getPixelIndex(x, y);
    if (index == -1) return;

    this.pixels[index] = r;
    this.pixels[index + 1] = g;
    this.pixels[index + 2] = b;
    this.pixels[index + 3] = a;
  }

  updatePixels() {
    this.pixelsId = randomString();
  }
}

export default Layer;
