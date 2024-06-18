import { randomString } from "@shared/utils";
import Color from "./color";
import TemporaryLayer from "./temporaryLayer";
import { RESIZE_BACKGROUND_COLOR } from "@client/constants";

class Layer {
  id: string;

  name: string;
  active: boolean;
  visible: boolean;

  width: number;
  height: number;

  pixels: Uint8ClampedArray;
  pixelsId: string;

  pixelsCopy: Uint8ClampedArray;

  temporaryLayer?: TemporaryLayer;

  constructor(width: number, height: number, initial: boolean) {
    this.id = randomString();

    this.name = initial ? "Background" : "Layer #";
    this.active = initial;
    this.visible = true;

    this.width = width;
    this.height = height;

    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.pixels.fill(initial ? 255 : 0);

    this.pixelsCopy = new Uint8ClampedArray(this.pixels);

    this.pixelsId = this.id;
  }

  createPixelsCopy() {
    this.pixelsCopy = new Uint8ClampedArray(this.pixels);
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

  createTemporaryLayer(width: number, height: number, x: number, y: number) {
    this.temporaryLayer = new TemporaryLayer(this, width, height, x, y);
    return this.temporaryLayer;
  }

  clone() {
    const newLayer = new Layer(0, 0, false);

    newLayer.id = this.id;

    newLayer.name = this.name;
    newLayer.active = this.active;
    newLayer.visible = this.visible;

    newLayer.width = this.width;
    newLayer.height = this.height;

    newLayer.pixels = new Uint8ClampedArray(this.pixels);
    newLayer.pixelsId = this.pixelsId;

    newLayer.pixelsCopy = new Uint8ClampedArray(this.pixelsCopy);

    return newLayer;
  }

  resize(
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
  ) {
    const newPixels = new Uint8ClampedArray(newWidth * newHeight * 4);

    const selection = {
      x: 0,
      y: 0,
    };

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const newIndex = (x + y * newWidth) * 4;

        if (x < oldWidth && y < oldHeight) {
          const oldIndex = (selection.x + x + (selection.y + y) * oldWidth) * 4;

          newPixels[newIndex] = this.pixels[oldIndex];
          newPixels[newIndex + 1] = this.pixels[oldIndex + 1];
          newPixels[newIndex + 2] = this.pixels[oldIndex + 2];
          newPixels[newIndex + 3] = this.pixels[oldIndex + 3];
        } else {
          newPixels[newIndex] = RESIZE_BACKGROUND_COLOR.r;
          newPixels[newIndex + 1] = RESIZE_BACKGROUND_COLOR.g;
          newPixels[newIndex + 2] = RESIZE_BACKGROUND_COLOR.b;
          newPixels[newIndex + 3] = RESIZE_BACKGROUND_COLOR.a;
        }
      }
    }

    this.pixels = newPixels;

    this.width = newWidth;
    this.height = newHeight;

    this.updatePixels();
  }
}

export type ActiveLayersState = { [id: string]: null };

export default Layer;
