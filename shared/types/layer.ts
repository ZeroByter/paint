import { randomString } from "@shared/utils";
import Color from "./color";

class Layer {
  id: string;

  name: string;
  order: number;
  active: boolean;
  visible: boolean;

  width: number;
  height: number;

  pixels: Uint8ClampedArray;
  pixelsId: string;

  constructor(
    width: number,
    height: number,
    initial: boolean,
    newOrder: number = 0
  ) {
    this.id = randomString();

    this.name = initial ? "Background" : "Layer #";
    this.order = newOrder;
    this.active = initial;
    this.visible = true;

    this.width = width;
    this.height = height;

    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.pixels.fill(initial ? 255 : 0);

    this.pixelsId = this.id;
  }

  getPixelIndex(x: number, y: number) {
    const index = x + y * this.width;
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) return -1;

    return index * 4;
  }

  getPixelColor(x: number, y: number) {
    const index = this.getPixelIndex(x, y);
    if (index == -1) return new Color();

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
    if (index == -1) return;

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

  clone() {
    const newLayer = new Layer(0, 0, false);

    newLayer.id = this.id;

    newLayer.name = this.name;
    newLayer.order = this.order;
    newLayer.active = this.active;
    newLayer.visible = this.visible;

    newLayer.width = this.width;
    newLayer.height = this.height;

    newLayer.pixels = new Uint8ClampedArray(this.pixels);
    newLayer.pixelsId = this.pixelsId;

    return newLayer;
  }
}

export type ActiveLayersState = { [id: string]: null };

export default Layer;
