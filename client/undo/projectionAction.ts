import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import { PaintContextType } from "components/contexts/paint";
import { getUndoPixelColor } from "components/contexts/paintUtils";
import UndoAction from "./undoAction";
import UndoPixelsAbility, { UndoPixel } from "./undoPixelColor";

export default class HardMoveAction
  extends UndoAction
  implements UndoPixelsAbility
{
  pixels: Map<string, Map<number, UndoPixel>>;

  width: number;
  height: number;

  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;

  constructor(
    pixels: Map<string, Map<number, UndoPixel>>,
    width: number,
    height: number,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) {
    super();

    this.pixels = pixels;

    this.width = width;
    this.height = height;

    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.targetX = targetX;
    this.targetY = targetY;
  }

  undo(state: PaintContextType): void {
    const { layers } = state;

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of layers) {
      layersMap[layer.id] = layer;
    }

    const layerIds = this.pixels.keys();
    for (const layerId of layerIds) {
      const layer = layersMap[layerId];

      if (!layer) continue;

      const targetPixels: Color[] = [];
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          targetPixels.push(
            layer.getPixelColor(this.targetX + x, this.targetY + y)
          );
        }
      }

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const beforeActionPixel = getUndoPixelColor(
            state,
            layerId,
            this.targetX + x,
            this.targetY + y
          );

          layer.setPixelData(
            this.targetX + x,
            this.targetY + y,
            beforeActionPixel.r,
            beforeActionPixel.g,
            beforeActionPixel.b,
            beforeActionPixel.a
          );
        }
      }

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const targetPixel = targetPixels[x + y * this.width];

          layer.setPixelData(
            this.sourceX + x,
            this.sourceY + y,
            targetPixel.r,
            targetPixel.g,
            targetPixel.b,
            targetPixel.a
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

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          layer.setPixelData(this.sourceX + x, this.sourceY + y, 0, 0, 0, 0);
        }
      }

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const sourcePixel = pixels.get(x + y * this.width);

          if (!sourcePixel) continue;

          layer.setPixelData(
            this.targetX + x,
            this.targetY + y,
            sourcePixel.r,
            sourcePixel.g,
            sourcePixel.b,
            sourcePixel.a
          );
        }
      }

      layer.updatePixels();
    }
  }

  getUndoPixelColor(
    state: PaintContextType,
    layerId: string,
    x: number,
    y: number
  ) {
    if (!this.pixels.has(layerId)) return null;

    if (
      x > this.targetX - 1 &&
      y > this.targetY - 1 &&
      x < this.targetX + this.width &&
      y < this.targetY + this.height
    ) {
      const layer = this.pixels.get(layerId);
      if (!layer) return null;
      const localX = x - this.targetX;
      const localY = y - this.targetY;
      const index = localX + localY * this.width;
      return layer.get(index) ?? null;
    }

    if (
      x > this.sourceX - 1 &&
      y > this.sourceY - 1 &&
      x < this.sourceX + this.width &&
      y < this.sourceY + this.height
    ) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    return null;
  }
}
