import Layer from "@shared/types/layer";
import { PaintContextType } from "components/contexts/paint";
import {
  deleteLayerById,
  getUndoPixelColor,
} from "components/contexts/paintUtils";
import UndoAction from "./undoAction";
import UndoPixelsAbility, { UndoPixel } from "./undoPixelColor";

export default class InverseProjectionAction
  extends UndoAction
  implements UndoPixelsAbility
{
  affectedLayers: string[];

  newLayerId: string;
  newLayerName: string;
  newLayerActive: boolean;
  newLayerVisible: boolean;
  newLayerPixels: Uint8ClampedArray;
  newLayerIndex: number;

  constructor(
    affectedLayers: string[],
    newLayerId: string,
    newLayerName: string,
    newLayerActive: boolean,
    newLayerVisible: boolean,
    newLayerPixels: Uint8ClampedArray,
    newLayerIndex: number
  ) {
    super();

    this.affectedLayers = affectedLayers;

    this.newLayerId = newLayerId;
    this.newLayerName = newLayerName;
    this.newLayerActive = newLayerActive;
    this.newLayerVisible = newLayerVisible;
    this.newLayerPixels = newLayerPixels;
    this.newLayerIndex = newLayerIndex;
  }

  undo(state: PaintContextType): void {
    const { layers, width, height } = state;

    const layersMap: { [id: string]: Layer } = {};
    for (const layer of layers) {
      layersMap[layer.id] = layer;
    }

    for (const layerId of this.affectedLayers) {
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

    deleteLayerById(state, this.newLayerId);
  }

  redo(state: PaintContextType): void {
    const { layers, setLayers, width, height } = state;

    const newLayer = new Layer(width, height, false);
    newLayer.id = this.newLayerId;
    newLayer.name = this.newLayerName;
    newLayer.active = this.newLayerActive;
    newLayer.visible = this.newLayerVisible;
    newLayer.pixels = this.newLayerPixels;
    newLayer.createPixelsCopy();

    const newLayers = [...layers];
    newLayers.splice(this.newLayerIndex + 1, 0, newLayer);
    setLayers(newLayers);
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
