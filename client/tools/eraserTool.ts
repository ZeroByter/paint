import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { clamp, clamp01, getDistance } from "@client/utils";
import Location from "@shared/types/location";
import Color from "@shared/types/color";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";
import Layer from "@shared/types/layer";
import { BrushData, generateBrushEffect } from "./brushTool";
import {
  addUndoAction,
  updateActiveLayers,
} from "components/contexts/paintUtils";

class EraserTool extends Tool {
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

    this.text = "E";
    this.tooltip = "Eraser";
  }

  doErase(
    state: PaintContextType,
    mouseLoc: Location,
    primary: boolean,
    lastDragLocation: Location
  ) {
    const { primaryColor, secondaryColor, width, height, setLayers } = state;

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

        for (const id in this.layersCloneMap) {
          const layer = this.layersCloneMap[id];

          if (!layer.active) continue;

          if (!this.pixels.has(layer.id)) {
            this.pixels.set(layer.id, new Map<number, UndoPixel>());
          }

          const existingColor = layer.getPixelColor(finalX, finalY);
          const newAlpha = clamp(
            existingColor.a - this.cachedAlpha.data[i],
            0,
            255
          );
          const newColor = new Color(
            existingColor.r,
            existingColor.g,
            existingColor.b,
            newAlpha
          );

          layer.setPixelData(
            finalX,
            finalY,
            newColor.r,
            newColor.g,
            newColor.b,
            newColor.a
          );

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

    if (this.cachedAlpha.size == 1) {
      this.cachedAlpha.data[0] = useColor.a;
    }

    this.lastDrawIndex = mouseLoc.x + mouseLoc.y * width;

    this.doErase(state, mouseLoc, primary, mouseLoc);

    updateActiveLayers(state);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { width } = state;

    const drawIndex = args.accurateMouseLoc.x + args.accurateMouseLoc.y * width;

    if (drawIndex == this.lastDrawIndex) return;

    this.lastDrawIndex = drawIndex;

    this.doErase(
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
  }
}

export default EraserTool;
