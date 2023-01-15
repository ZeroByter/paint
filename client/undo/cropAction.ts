import Layer from "@shared/types/layer";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import { cropToSelection } from "components/contexts/paintUtils";
import UndoAction from "./undoAction";

export type CroppedLayer = {
  id: string;
  pixels: Uint8ClampedArray;
};

export default class CropAction extends UndoAction {
  beforeLayers: CroppedLayer[];
  beforeWidth: number;
  beforeHeight: number;

  selection: Selection;

  constructor(
    beforeLayers: CroppedLayer[],
    beforeWidth: number,
    beforeHeight: number,
    selection: Selection
  ) {
    super();

    this.beforeLayers = beforeLayers;
    this.beforeWidth = beforeWidth;
    this.beforeHeight = beforeHeight;

    this.selection = selection;
  }

  undo(state: PaintContextType): void {
    const newLayers = [...state.layers];

    state.setWidth(this.beforeWidth);
    state.setHeight(this.beforeHeight);

    const layersMap: { [id: string]: Layer } = {};

    for (const layer of newLayers) {
      layersMap[layer.id] = layer;
    }

    for (const croppedLayer of this.beforeLayers) {
      const layer = layersMap[croppedLayer.id];

      layer.width = this.beforeWidth;
      layer.height = this.beforeHeight;

      layer.pixels = croppedLayer.pixels;

      layer.updatePixels();
    }

    state.setLayers(newLayers);
  }

  redo(state: PaintContextType): void {
    state.setSelection(this.selection);

    cropToSelection(state, this.selection, false);
  }
}
