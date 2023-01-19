import PencilAction from "@client/undo/pencilAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { getDistance, ilerp, lerp } from "@client/utils";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import {
  addPixelColor,
  addUndoAction,
  canAffectPixel,
  updateActiveLayers,
} from "components/contexts/paintUtils";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

export type BrushData = {
  size: number;
  data: number[];
};

export const generateBrushEffect = (
  x: number, //x and y aren't used yet, but they are given here in order to implement precise sub-pixel coloring later
  y: number,
  radius: number,
  opacity: number,
  hardness: number
): BrushData => {
  const data = [];

  const size = radius;

  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = (i / size) >> 0; //fast floor for positive numbers

    const distance = getDistance(x + 0.5, y + 0.5, size / 2, size / 2);

    const alpha =
      ilerp(size / 2, size / 2 - lerp(size / 2, 1, hardness ** 0.5), distance) *
      opacity;

    data.push(alpha);
  }

  return {
    size,
    data,
  };
};

class BrushTool extends Tool {
  lastDrawIndex = -1;

  pixels = new Map<string, Map<number, UndoPixel>>();

  layersClone: Layer[] = [];
  layersCloneMap: { [id: string]: Layer } = {};

  cachedAlpha: BrushData = {
    data: [],
    size: 0,
  };

  constructor() {
    super();

    this.text = "B";
    this.tooltip = "Brush";
  }

  doPaint(
    state: PaintContextType,
    mouseLoc: Location,
    primary: boolean,
    lastDragLocation: Location
  ) {
    const { primaryColor, secondaryColor, width, height, setLayers } = state;

    const useColor = primary ? primaryColor : secondaryColor;

    const lastMouseLoc = lastDragLocation.copy();

    const distance = Math.ceil(
      getDistance(mouseLoc.x, mouseLoc.y, lastMouseLoc.x, lastMouseLoc.y)
    );

    const loopDistance = Math.max(1, distance);

    const direction = lastMouseLoc.minus(mouseLoc).normalized();

    for (let i = 0; i < loopDistance; i++) {
      let paintLocation = mouseLoc
        .add(direction.add(direction.multiply(i)))
        .round();
      if (distance == 0) {
        paintLocation = mouseLoc;
      }

      const brushSize = this.cachedAlpha.size;

      const halfSize = Math.floor(brushSize / 2);
      const doubleSize = brushSize * brushSize;

      for (let i = 0; i < doubleSize; i++) {
        const x = i % brushSize;
        const y = (i / brushSize) >> 0;

        const finalX = paintLocation.x - halfSize + x;
        const finalY = paintLocation.y - halfSize + y;

        if (!canAffectPixel(state, finalX, finalY)) {
          continue;
        }

        const finalIndex = finalX + finalY * width;

        const newColorsPerLayers = addPixelColor(
          state,
          finalX,
          finalY,
          useColor.r,
          useColor.g,
          useColor.b,
          this.cachedAlpha.data[i],
          false,
          this.layersClone
        );

        for (const id in this.layersCloneMap) {
          const layer = this.layersCloneMap[id];

          if (!layer.active) continue;

          if (!this.pixels.has(layer.id)) {
            this.pixels.set(layer.id, new Map<number, UndoPixel>());
          }

          const newColor = newColorsPerLayers[layer.id];

          this.pixels.get(layer.id)!.set(finalIndex, {
            r: newColor.r,
            g: newColor.g,
            b: newColor.b,
            a: newColor.a,
          });
        }
      }
    }

    setLayers(this.layersClone);
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    if (this.pixels.size != 0) return;

    const {
      mouseLoc,
      layers,
      brushSize,
      brushHardness,
      primaryColor,
      secondaryColor,
      width,
    } = state;

    this.pixels = new Map<string, Map<number, UndoPixel>>();

    this.layersClone = layers.map((layer) => layer.clone());
    this.layersCloneMap = {};
    for (const layer of this.layersClone) {
      this.layersCloneMap[layer.id] = layer;
    }

    const primary = args.button == 0;
    const useColor = primary ? primaryColor : secondaryColor;

    this.cachedAlpha = generateBrushEffect(
      mouseLoc.x,
      mouseLoc.y,
      brushSize,
      useColor.a,
      brushHardness
    );

    this.lastDrawIndex = mouseLoc.x + mouseLoc.y * width;

    this.doPaint(state, mouseLoc, primary, mouseLoc);

    updateActiveLayers(state);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { width } = state;

    const drawIndex = args.accurateMouseLoc.x + args.accurateMouseLoc.y * width;

    if (drawIndex == this.lastDrawIndex) return;

    this.lastDrawIndex = drawIndex;

    this.doPaint(
      state,
      args.accurateMouseLoc,
      args.buttons == 1,
      args.lastDragLocation
    );

    updateActiveLayers(state);
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    if (this.pixels.size == 0) return;
    addUndoAction(state, new PencilAction(this.pixels));
    this.pixels = new Map<string, Map<number, UndoPixel>>();
  }
}

export default BrushTool;
