import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { clamp01, getDistance, getFastDistance } from "@client/utils";
import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class BrushTool extends Tool {
  pixels: UndoPixel[] = [];

  layersClone: Layer[] = [];
  layersCloneMap: { [id: string]: Layer } = {};

  cachedLayersCopy: Layer[] = [];
  cachedAlpha: number[] = [];

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
      brushSize,
      setLayers,
    } = state;

    const useColor = primary ? primaryColor : secondaryColor;

    const lastMouseLoc = lastDragLocation.copy();

    const distance = Math.ceil(
      getDistance(mouseLoc.x, mouseLoc.y, lastMouseLoc.x, lastMouseLoc.y)
    );

    const direction = lastMouseLoc.minus(mouseLoc).normalized();

    for (let i = 0; i < distance; i++) {
      const paintLocation = mouseLoc
        .add(direction.add(direction.multiply(i)))
        .round();

      const halfSize = Math.floor(brushSize / 2);
      const doubleSize = brushSize * brushSize;

      for (let i = 0; i < doubleSize; i++) {
        const x = i % brushSize;
        const y = Math.floor(i / brushSize);

        const finalX = paintLocation.x - halfSize + x;
        const finalY = paintLocation.y - halfSize + y;

        const newColorsPerLayers = addPixelColor(
          finalX,
          finalY,
          useColor.r,
          useColor.g,
          useColor.b,
          this.cachedAlpha[i],
          false,
          this.cachedLayersCopy
        );

        for (const id in this.layersCloneMap) {
          const layer = this.layersCloneMap[id];

          //this push function is causing a lot of lag with big brushes, maybe replace it with Map or something?
          this.pixels.push({
            x: finalX,
            y: finalY,
            colorBefore: layer.getPixelColor(finalX, finalY),
            colorAfter: newColorsPerLayers[id],
            layer: id,
          });
        }
      }
    }

    setLayers(this.cachedLayersCopy);
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
    } = state;

    this.pixels = [];
    this.layersClone = layers.map((layer) => layer.clone());
    this.layersCloneMap = {};
    for (const layer of this.layersClone) {
      this.layersCloneMap[layer.id] = layer;
    }

    this.cachedAlpha = [];
    this.cachedLayersCopy = layers.map((layer) => layer.clone());

    const primary = args.button == 0;

    const useColor = primary ? primaryColor : secondaryColor;
    const halfSize = Math.floor(brushSize / 2);
    const doubleSize = brushSize * brushSize;

    for (let i = 0; i < doubleSize; i++) {
      const x = i % brushSize;
      const y = Math.floor(i / brushSize);

      const alpha = Math.round(
        clamp01(1 - getDistance(x, y, halfSize, halfSize) / halfSize) *
          useColor.a *
          brushHardness
      );

      this.cachedAlpha.push(alpha);
    }

    this.doPaint(state, mouseLoc, primary, mouseLoc.add(0, 1));

    updateActiveLayers();
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { updateActiveLayers } = state;

    this.doPaint(
      state,
      args.accurateMouseLoc,
      args.buttons == 1,
      args.lastDragLocation
    );

    updateActiveLayers();
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    if (this.pixels.length == 0) return;
    state.addUndoAction(new PencilAction(this.pixels));
  }
}

export default BrushTool;
