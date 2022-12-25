import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import UndoAction from "./undoAction";

export type UndoPixel = {
  location: Location;
  colorBefore: Color;
  colorAfter: Color;
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
      layersMap[pixel.layer].setPixelData(
        pixel.location.x,
        pixel.location.y,
        pixel.colorBefore.r,
        pixel.colorBefore.g,
        pixel.colorBefore.b,
        pixel.colorBefore.a
      );
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
        pixel.location.x,
        pixel.location.y,
        pixel.colorAfter.r,
        pixel.colorAfter.g,
        pixel.colorAfter.b,
        pixel.colorAfter.a
      );
    }

    for (const layer of cloneLayers) {
      layer.updatePixels();
    }

    state.setLayers(cloneLayers);
  }
}
