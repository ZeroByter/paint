import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import { PaintContextType } from "components/contexts/paint";
import { getUndoPixelColor } from "components/contexts/paintUtils";
import UndoAction from "./undoAction";
import UndoPixelsAbility, { UndoPixel } from "./undoPixelColor";

export default class ProjectionAction
  extends UndoAction
  implements UndoPixelsAbility
{
  pixels: Map<string, Map<number, UndoPixel>>;

  constructor(pixels: Map<string, Map<number, UndoPixel>>) {
    super();

    this.pixels = pixels;
  }

  undo(state: PaintContextType): void {
    const { layers, width, height } = state;

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of layers) {
      layersMap[layer.id] = layer;
    }

    const layerIds = this.pixels.keys();
    for (const layerId of layerIds) {
      const layer = layersMap[layerId];

      if (!layer) continue;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const beforeActionPixel = getUndoPixelColor(state, layerId, x, y);

          layer.setPixelData(
            x,
            y,
            beforeActionPixel.r,
            beforeActionPixel.g,
            beforeActionPixel.b,
            beforeActionPixel.a
          );
        }
      }

      layer.updatePixels();
    }
  }

  redo(state: PaintContextType): void {
    const { layers } = state;

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of layers) {
      layersMap[layer.id] = layer;
    }

    const pixelEntries = this.pixels.entries();
    for (const [layerId, pixels] of pixelEntries) {
      const layer = layersMap[layerId];

      if (!layer) continue;

      const newPixels = new Uint8ClampedArray(pixels.size * 4);

      const pixelsEntries = pixels.entries();
      for (const [index, pixel] of pixelsEntries) {
        newPixels[index * 4] = pixel.r;
        newPixels[index * 4 + 1] = pixel.g;
        newPixels[index * 4 + 2] = pixel.b;
        newPixels[index * 4 + 3] = pixel.a;
      }

      layer.pixels = newPixels;
      layer.updatePixels();
    }
  }

  getUndoPixelColor(
    state: PaintContextType,
    layerId: string,
    x: number,
    y: number
  ) {
    const layer = this.pixels.get(layerId);
    if (!layer) return null;

    const pixel = layer.get(x + y * state.width);

    return pixel ?? null;
  }
}
