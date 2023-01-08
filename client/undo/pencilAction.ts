import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import UndoAction from "./undoAction";

export type UndoPixel = {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  a: number;
  layer: string;
};

export default class PencilAction extends UndoAction {
  pixels: UndoPixel[];

  constructor(pixels: UndoPixel[]) {
    super();

    this.pixels = pixels;
  }

  undo(state: PaintContextType): void {
    const cloneLayers = [...state.layers];

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of cloneLayers) {
      layersMap[layer.id] = layer;
    }

    for (const pixel of this.pixels) {
      //TODO: Get color of layer before this undo
      //TODO: Develop generic function to get previous color of pixel before a certain undo action...
      layersMap[pixel.layer].setPixelData(pixel.x, pixel.y, 255, 0, 0, 255);
    }

    for (const layer of cloneLayers) {
      layer.updatePixels();
    }

    state.setLayers(cloneLayers);
  }

  redo(state: PaintContextType): void {
    const cloneLayers = [...state.layers];

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of cloneLayers) {
      layersMap[layer.id] = layer;
    }

    for (const pixel of this.pixels) {
      layersMap[pixel.layer].setPixelData(
        pixel.x,
        pixel.y,
        pixel.r,
        pixel.g,
        pixel.b,
        pixel.a
      );
    }

    for (const layer of cloneLayers) {
      layer.updatePixels();
    }

    state.setLayers(cloneLayers);
  }
}
