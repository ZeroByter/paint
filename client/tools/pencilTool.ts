import PencilAction from "@client/undo/pencilAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { getDistance } from "@client/utils";
import Color from "@shared/types/color";
import Location from "@shared/types/location";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import {
  addUndoAction,
  canAffectPixel,
  setPixelColor,
  updateActiveLayers,
} from "components/contexts/paintUtils";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class PencilTool extends Tool {
  pixels = new Map<string, Map<number, UndoPixel>>();
  drawnLocations: { [index: number]: undefined } = {};

  constructor() {
    super();

    this.text = "P";
    this.tooltip = "Pencil";
  }

  doPaint(
    state: PaintContextType,
    mouseLoc: Location,
    primary: boolean,
    lastDragLocation: Location
  ) {
    const { primaryColor, secondaryColor, layers, width, height } = state;

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

      const paintLocationIndex = paintLocation.x + paintLocation.y * width;

      if (paintLocationIndex in this.drawnLocations) continue;
      this.drawnLocations[paintLocationIndex] = undefined;

      if (canAffectPixel(state, paintLocation.x, paintLocation.y)) {
        for (const layer of layers) {
          if (!layer.active) continue;

          if (!this.pixels.has(layer.id)) {
            this.pixels.set(layer.id, new Map<number, UndoPixel>());
          }

          this.pixels.get(layer.id)!.set(paintLocationIndex, {
            r: useColor.r,
            g: useColor.g,
            b: useColor.b,
            a: useColor.a,
          });
        }

        setPixelColor(
          state,
          paintLocation.x,
          paintLocation.y,
          useColor.r,
          useColor.g,
          useColor.b,
          useColor.a,
          false
        );
      }
    }
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { mouseLoc } = state;

    this.pixels = new Map<string, Map<number, UndoPixel>>();
    this.drawnLocations = {};

    this.doPaint(state, mouseLoc, args.button == 0, mouseLoc);

    updateActiveLayers(state);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
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
  }
}

export default PencilTool;
