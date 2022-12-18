import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { getDistance } from "@client/utils";
import Color from "@shared/types/color";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class EraserTool extends Tool {
  pixels: UndoPixel[] = [];
  drawnLocations: { [index: number]: undefined } = {};

  constructor() {
    super();

    this.text = "E";
    this.tooltip = "Eraser";
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const {
      setPixelColor,
      erasePixel,
      primaryColor,
      secondaryColor,
      mouseLoc,
      layers,
      width,
    } = state;

    const useColor = args.button == 0 ? primaryColor : secondaryColor;

    this.pixels = [];
    const mouseLocCopy = mouseLoc.copy();
    this.drawnLocations = {
      [mouseLocCopy.x + mouseLocCopy.y * width]: undefined,
    };

    for (const layer of layers) {
      if (!layer.active) continue;

      const colorBefore = layer.getPixelColor(mouseLocCopy.x, mouseLocCopy.y);

      this.pixels.push({
        location: mouseLocCopy,
        colorBefore,
        colorAfter: new Color(
          colorBefore.r,
          colorBefore.g,
          colorBefore.b,
          255 - useColor.a
        ),
        layer: layer.id,
      });
    }

    erasePixel(mouseLoc.x, mouseLoc.y, useColor.a, true);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const {
      primaryColor,
      secondaryColor,
      setPixelColor,
      updateActiveLayers,
      erasePixel,
      layers,
      width,
    } = state;

    const mouseLoc = args.accurateMouseLoc;

    const useColor = args.buttons == 1 ? primaryColor : secondaryColor;

    const lastMouseLoc = args.lastDragLocation.copy();

    const distance = Math.round(
      getDistance(mouseLoc.x, mouseLoc.y, lastMouseLoc.x, lastMouseLoc.y)
    );

    const direction = lastMouseLoc.minus(mouseLoc).normalized();

    for (let i = 0; i < distance; i++) {
      const paintLocation = mouseLoc
        .add(direction.add(direction.multiply(i)))
        .round();

      const paintLocationIndex = paintLocation.x + paintLocation.y * width;

      if (paintLocationIndex in this.drawnLocations) continue;

      this.drawnLocations[paintLocationIndex] = undefined;

      for (const layer of layers) {
        if (!layer.active) continue;

        const colorBefore = layer.getPixelColor(
          paintLocation.x,
          paintLocation.y
        );

        this.pixels.push({
          location: paintLocation,
          colorBefore,
          colorAfter: new Color(
            colorBefore.r,
            colorBefore.g,
            colorBefore.b,
            255 - useColor.a
          ),
          layer: layer.id,
        });
      }

      erasePixel(paintLocation.x, paintLocation.y, useColor.a, false);
    }

    updateActiveLayers();
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    state.addUndoAction(new PencilAction(this.pixels));
  }
}

export default EraserTool;
