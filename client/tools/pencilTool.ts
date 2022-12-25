import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { getDistance } from "@client/utils";
import Color from "@shared/types/color";
import Location from "@shared/types/location";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class PencilTool extends Tool {
  pixels: UndoPixel[] = [];
  drawnLocations: { [index: number]: undefined } = {};

  constructor() {
    super();

    this.text = "P";
    this.tooltip = "Pencil";
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const {
      setPixelColor,
      primaryColor,
      secondaryColor,
      mouseLoc,
      layers,
      width,
      height,
    } = state;

    const useColor = args.button == 0 ? primaryColor : secondaryColor;

    this.pixels = [];
    this.drawnLocations = {
      [mouseLoc.x + mouseLoc.y * width]: undefined,
    };

    if (
      mouseLoc.x >= 0 &&
      mouseLoc.y >= 0 &&
      mouseLoc.x < width &&
      mouseLoc.y < height
    ) {
      for (const layer of layers) {
        if (!layer.active) continue;

        this.pixels.push({
          location: mouseLoc,
          colorBefore: layer.getPixelColor(mouseLoc.x, mouseLoc.y),
          colorAfter: useColor,
          layer: layer.id,
        });
      }
    }

    setPixelColor(
      mouseLoc.x,
      mouseLoc.y,
      useColor.r,
      useColor.g,
      useColor.b,
      useColor.a,
      true
    );
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const {
      primaryColor,
      secondaryColor,
      setPixelColor,
      updateActiveLayers,
      layers,
      width,
      height,
    } = state;

    const mouseLoc = args.accurateMouseLoc;

    const useColor = args.buttons == 1 ? primaryColor : secondaryColor;

    const lastMouseLoc = args.lastDragLocation.copy();

    const distance = Math.ceil(
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

      if (
        paintLocation.x >= 0 &&
        paintLocation.y >= 0 &&
        paintLocation.x < width &&
        paintLocation.y < height
      ) {
        for (const layer of layers) {
          if (!layer.active) continue;

          this.pixels.push({
            location: paintLocation,
            colorBefore: layer.getPixelColor(paintLocation.x, paintLocation.y),
            colorAfter: useColor,
            layer: layer.id,
          });
        }
      }

      setPixelColor(
        paintLocation.x,
        paintLocation.y,
        useColor.r,
        useColor.g,
        useColor.b,
        useColor.a,
        false
      );
    }

    updateActiveLayers();
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    state.addUndoAction(new PencilAction(this.pixels));
  }
}

export default PencilTool;
