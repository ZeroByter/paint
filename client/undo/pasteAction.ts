import Layer from "@shared/types/layer";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import { clone, cloneDeep } from "lodash/fp";
import UndoAction from "./undoAction";

export default class PasteAction extends UndoAction {
  beforeLayers: Layer[];
  beforeWidth: number;
  beforeHeight: number;

  afterImage: HTMLImageElement;

  constructor(
    beforeLayers: Layer[],
    beforeWidth: number,
    beforeHeight: number,
    afterImage: HTMLImageElement
  ) {
    super();

    this.beforeLayers = [...beforeLayers];
    this.beforeWidth = beforeWidth;
    this.beforeHeight = beforeHeight;

    this.afterImage = afterImage;
  }

  undo(state: PaintContextType): void {
    const newLayers = this.beforeLayers;

    state.setWidth(this.beforeWidth);
    state.setHeight(this.beforeHeight);

    for (const layer of this.beforeLayers) {
      layer.updatePixels();
    }

    state.setLayers(newLayers);
  }

  redo(state: PaintContextType): void {
    state.loadFromImage(this.afterImage);
  }
}
