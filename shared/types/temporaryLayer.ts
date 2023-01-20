import { randomString } from "@shared/utils";
import Color from "./color";
import Layer from "./layer";

class TemporaryLayer {
  id: string;

  x: number;
  y: number;
  width: number;
  height: number;

  order: number;

  pixels: Uint8ClampedArray;
  pixelsId: string;

  parentLayer: Layer;

  constructor(
    layer: Layer,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    this.id = layer.id;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.order = layer.order + 0.5;

    this.pixels = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < this.pixels.length / 4; i++) {
      const x = i % width;
      const y = (i / width) >> 0; //fast floor bit operation for positive numbers

      const color = layer.getPixelColor(this.x + x, this.y + y);

      this.pixels[i * 4] = color.r;
      this.pixels[i * 4 + 1] = color.g;
      this.pixels[i * 4 + 2] = color.b;
      this.pixels[i * 4 + 3] = color.a;
    }

    this.pixelsId = randomString();

    this.parentLayer = layer;
  }

  getPixelIndex(x: number, y: number) {
    const index = x + y * this.width;
    return index * 4;
  }

  getPixelColor(x: number, y: number) {
    const index = this.getPixelIndex(x, y);

    return new Color(
      this.pixels[index],
      this.pixels[index + 1],
      this.pixels[index + 2],
      this.pixels[index + 3]
    );
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

    this.pixels[index] = r;
    this.pixels[index + 1] = g;
    this.pixels[index + 2] = b;
    this.pixels[index + 3] = a;
  }

  setPixelDataFromImage(image: HTMLImageElement) {
    image.crossOrigin = "anonymous";

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width == 0 || canvas.height == 0) return;

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.pixels = imageData.data;
  }

  updatePixels() {
    this.pixelsId = randomString();
  }

  pasteOntoLayer() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = x + y * this.width;

        const r = this.pixels[i * 4];
        const g = this.pixels[i * 4 + 1];
        const b = this.pixels[i * 4 + 2];
        const a = this.pixels[i * 4 + 3];

        this.parentLayer.setPixelData(this.x + x, this.y + y, r, g, b, a);
      }
    }

    this.parentLayer.updatePixels();
  }
}

export default TemporaryLayer;
