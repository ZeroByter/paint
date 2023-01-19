import { PaintContextType } from "components/contexts/paint";

export type UndoPixel = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type getUndoPixelColorType = (
  state: PaintContextType,
  layerId: string,
  x: number,
  y: number
) => UndoPixel | null;

export default interface UndoPixelsAbility {
  getUndoPixelColor: getUndoPixelColorType;
}
