import Layer from "@shared/types/layer";
import { PaintContextType } from "components/contexts/paint";
import { getUndoPixelColor } from "components/contexts/paintUtils";
import UndoAction from "./undoAction";

export type UndoPixel = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export default class PencilAction extends UndoAction {
  pixels: Map<string, Map<number, UndoPixel>>;

  constructor(pixels: Map<string, Map<number, UndoPixel>>) {
    super();

    this.pixels = pixels;
  }

  undo(state: PaintContextType): void {
    const cloneLayers = [...state.layers];

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of cloneLayers) {
      layersMap[layer.id] = layer;
    }

    for (const [layerId, pixelsData] of this.pixels) {
      for (const [index, color] of pixelsData) {
        const x = index % state.width;
        const y = (index / state.width) >> 0; //fast floor bit operation for positive numbers

        const undoColor = getUndoPixelColor(state, layerId, x, y);

        layersMap[layerId].setPixelData(
          x,
          y,
          undoColor.r,
          undoColor.g,
          undoColor.b,
          undoColor.a
        );
      }
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

    for (const [layerId, pixelsData] of this.pixels) {
      for (const [index, color] of pixelsData) {
        const x = index % state.width;
        const y = (index / state.width) >> 0; //fast floor bit operation for positive numbers

        layersMap[layerId].setPixelData(
          x,
          y,
          color.r,
          color.g,
          color.b,
          color.a
        );
      }
    }

    for (const layer of cloneLayers) {
      layer.updatePixels();
    }

    state.setLayers(cloneLayers);
  }
}
