import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { clamp01, getDistance, getFastDistance } from "@client/utils";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

export type BrushData = {
  size: number;
  data: number[];
};

export const generateBrushEffect = (
  x: number,
  y: number,
  radius: number,
  opacity: number,
  hardness: number
): BrushData => {
  const data = [];

  const size = radius;

  const halfSize = (size - 1) / 2;
  const doubleSize = size * size;

  for (let i = 0; i < doubleSize; i++) {
    const x = i % size;
    const y = (i / size) >> 0;

    const alpha = Math.round(
      clamp01(1 - getDistance(x, y, halfSize, halfSize) / (size / 2)) *
        opacity *
        hardness
    );

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
    const {
      addPixelColor,
      primaryColor,
      secondaryColor,
      width,
      height,
      setLayers,
    } = state;

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

        if (
          finalX < 0 ||
          finalY < 0 ||
          finalX > width - 1 ||
          finalY > height - 1
        ) {
          continue;
        }

        const finalIndex = finalX + finalY * width;

        const newColorsPerLayers = addPixelColor(
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
    const {
      updateActiveLayers,
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

    updateActiveLayers();
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { updateActiveLayers, width } = state;

    const drawIndex = args.accurateMouseLoc.x + args.accurateMouseLoc.y * width;

    if (drawIndex == this.lastDrawIndex) return;

    this.lastDrawIndex = drawIndex;

    this.doPaint(
      state,
      args.accurateMouseLoc,
      args.buttons == 1,
      args.lastDragLocation
    );

    updateActiveLayers();
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    if (this.pixels.size == 0) return;
    state.addUndoAction(new PencilAction(this.pixels));
  }
}

export default BrushTool;
