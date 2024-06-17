import { PaintContextType } from "components/contexts/paint";
import UndoAction from "./undoAction";
import UndoPixelsAbility, { UndoPixel } from "./undoPixelColor";
import { RESIZE_BACKGROUND_COLOR } from "@client/constants";
import { resize } from "components/contexts/paintUtils";

export default class ResizeAction
  extends UndoAction
  implements UndoPixelsAbility
{
  pixels: Map<string, Map<number, UndoPixel>>;

  preWidth: number;
  preHeight: number;
  postWidth: number;
  postHeight: number;

  constructor(
    pixels: Map<string, Map<number, UndoPixel>>,
    preWidth: number,
    preHeight: number,
    postWidth: number,
    postHeight: number
  ) {
    super();

    this.pixels = pixels;

    this.preWidth = preWidth;
    this.preHeight = preHeight;
    this.postWidth = postWidth;
    this.postHeight = postHeight;
  }

  undo(state: PaintContextType): void {
    resize(state, this.preWidth, this.preHeight);
  }

  redo(state: PaintContextType): void {
    resize(state, this.postWidth, this.postHeight);
  }

  getUndoPixelColor(
    state: PaintContextType,
    layerId: string,
    x: number,
    y: number
  ) {
    const data = this.pixels.get(layerId);

    if (x > this.preWidth - 1 || y > this.preHeight - 1) {
      return RESIZE_BACKGROUND_COLOR;
    }

    if (data) {
      const undoPixel = data.get(x + y * this.preWidth);
      if (undoPixel) {
        return undoPixel;
      }
    }

    return null;
  }
}
