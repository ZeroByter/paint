import Layer from "@shared/types/layer";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import { cropToSelection } from "components/contexts/paintUtils";
import UndoAction from "./undoAction";

export default class HardMoveAction extends UndoAction {
  layers: string[];

  width: number;
  height: number;

  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;

  constructor(
    layers: string[],
    width: number,
    height: number,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) {
    super();

    this.layers = layers;

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

    for (const layerId in this.layers) {
      const layer = layersMap[layerId];

      if (!layer) continue;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const targetPixel = layer.getPixelColor(
            this.targetX + x,
            this.targetY + y
          );

          //TODO: somewhere here need to also place old pixels where target position was
          //aka, the pixels that were under where we just hard moved the pixels onto

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

  redo(state: PaintContextType): void {}
}
