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
      height,
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

        const layerColors: {
          [id: string]: { colorBefore: Color; layer: Layer };
        } = {};

        if (x >= 0 && y >= 0 && x < width && y < height) {
          for (let i = 0; i < this.cachedLayersCopy.length; i++) {
            const activeLayer = this.cachedLayersCopy[i];
            const layerClone = this.layersClone[i];

            layerColors[activeLayer.id] = {
              colorBefore: layerClone.getPixelColor(finalX, finalY),
              layer: activeLayer,
            };
          }
        }

        addPixelColor(
          finalX,
          finalY,
          useColor.r,
          useColor.g,
          useColor.b,
          this.cachedAlpha[i],
          false,
          this.cachedLayersCopy
        );

        for (const id in layerColors) {
          const data = layerColors[id];

          this.pixels.push({
            location: new Location(finalX, finalY),
            colorBefore: data.colorBefore,
            colorAfter: data.layer.getPixelColor(finalX, finalY),
            layer: id,
          });
        }
      }

      // for (
      //   let y = paintLocation.y - brushSize;
      //   y < paintLocation.y + brushSize;
      //   y++
      // ) {
      //   for (
      //     let x = paintLocation.x - brushSize;
      //     x < paintLocation.x + brushSize;
      //     x++
      //   ) {
      //     const alpha = Math.round(
      //       clamp01(
      //         1 - getDistance(x, y, paintLocation.x, paintLocation.y) / brushSize
      //       ) *
      //         useColor.a *
      //         brushHardness
      //     );

      // const layerColors: {
      //   [id: string]: { colorBefore: Color; layer: Layer };
      // } = {};

      // if (x >= 0 && y >= 0 && x < width && y < height) {
      //   for (let i = 0; i < layers.length; i++) {
      //     const activeLayer = layers[i];
      //     const layerClone = this.layersClone[i];

      //     layerColors[activeLayer.id] = {
      //       colorBefore: layerClone.getPixelColor(x, y),
      //       layer: activeLayer,
      //     };
      //   }
      // }

      //     addPixelColor(x, y, useColor.r, useColor.g, useColor.b, alpha, false);

      // for (const id in layerColors) {
      //   const data = layerColors[id];

      //   this.pixels.push({
      //     location: new Location(x, y),
      //     colorBefore: data.colorBefore,
      //     colorAfter: data.layer.getPixelColor(x, y),
      //     layer: id,
      //   });
      // }
      //   }
      // }
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

    this.cachedAlpha = [];
    this.cachedLayersCopy = [...layers];

    const primary = args.button == 0;

    const useColor = primary ? primaryColor : secondaryColor;
    const halfSize = Math.floor(brushSize / 2);
    const doubleSize = brushSize * brushSize;

    for (let i = 0; i < doubleSize; i++) {
      const x = i % brushSize;
      const y = Math.floor(i / brushSize);

      const alpha = Math.round(
        clamp01(1 - getFastDistance(x, y, halfSize, halfSize) / brushSize) *
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
