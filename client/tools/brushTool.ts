import PencilAction, { UndoPixel } from "@client/undo/pencilAction";
import { clamp01, getDistance } from "@client/utils";
import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { cloneDeep } from "lodash/fp";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class BrushTool extends Tool {
  pixels: UndoPixel[] = [];
  layersClone: Layer[] = [];

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
      layers,
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

      const radius = 2;
      for (
        let y = paintLocation.y - radius;
        y < paintLocation.y + radius + 1;
        y++
      ) {
        for (
          let x = paintLocation.x - radius;
          x < paintLocation.x + radius + 1;
          x++
        ) {
          const alpha = Math.round(
            clamp01(
              1 - getDistance(x, y, paintLocation.x, paintLocation.y) / radius
            ) * useColor.a
          );

          const layerColors: {
            [id: string]: { colorBefore: Color; layer: Layer };
          } = {};

          if (x >= 0 && y >= 0 && x < width && y < height) {
            for (let i = 0; i < layers.length; i++) {
              const activeLayer = layers[i];
              const layerClone = this.layersClone[i];

              layerColors[activeLayer.id] = {
                colorBefore: layerClone.getPixelColor(x, y),
                layer: activeLayer,
              };
            }
          }

          addPixelColor(x, y, useColor.r, useColor.g, useColor.b, alpha, false);

          for (const id in layerColors) {
            const data = layerColors[id];

            this.pixels.push({
              location: new Location(x, y),
              colorBefore: data.colorBefore,
              colorAfter: data.layer.getPixelColor(x, y),
              layer: id,
            });
          }
        }
      }
    }
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { updateActiveLayers, mouseLoc, layers } = state;

    this.pixels = [];
    this.layersClone = cloneDeep(layers);

    this.doPaint(state, mouseLoc, args.button == 0, mouseLoc.add(0, 1));

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
