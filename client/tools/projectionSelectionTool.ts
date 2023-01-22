import ProjectionAction from "@client/undo/projectionAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { clamp, getDistance } from "@client/utils";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";
import { PaintContextType } from "components/contexts/paint";
import { addUndoAction } from "components/contexts/paintUtils";
import { projectImage } from "components/paint/projectionSelection/projectionSelectionMagic";
import Tool, { OnClickArgs, OnDragArgs, OnKeyDownArgs } from "./tool";

class ProjectionSelectTool extends Tool {
  dragStartLocation = new Location();

  constructor() {
    super();

    this.text = "PS";
    this.tooltip = "Projection Select";
    this.hidden = true;
  }

  onSelect(state: PaintContextType): void {
    const { layers, width, height } = state;

    for (const layer of layers) {
      if (!layer.active) continue;

      layer.createTemporaryLayer(width, height, 0, 0);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          layer.setPixelData(x, y, 0, 0, 0, 0);
        }
      }
      layer.updatePixels();
    }
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { mouseLoc, setSelectionClickability, width, height } = state;

    this.dragStartLocation = mouseLoc.copy();
    this.dragStartLocation.x = clamp(this.dragStartLocation.x, 0, width);
    this.dragStartLocation.y = clamp(this.dragStartLocation.y, 0, height);
    setSelectionClickability("CREATING");
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { mouseLoc, setProjectionSelection, width, height, layers } = state;

    const newMouseLoc = mouseLoc.copy();
    newMouseLoc.x = clamp(newMouseLoc.x, 0, width);
    newMouseLoc.y = clamp(newMouseLoc.y, 0, height);

    const topLeftX = this.dragStartLocation.x;
    const topLeftY = this.dragStartLocation.y;

    const topRightX = newMouseLoc.x;
    const topRightY = this.dragStartLocation.y;

    const bottomLeftX = this.dragStartLocation.x;
    const bottomLeftY = newMouseLoc.y;

    const bottomRightX = newMouseLoc.x;
    const bottomRightY = newMouseLoc.y;

    const newSelection = new ProjectionSelection(
      topLeftX,
      topLeftY,
      topRightX,
      topRightY,
      bottomLeftX,
      bottomLeftY,
      bottomRightX,
      bottomRightY
    );

    setProjectionSelection(newSelection);

    projectImage(layers, newSelection);
  }

  onKeyDown(state: PaintContextType, args: OnKeyDownArgs): void {
    const { setProjectionSelection, layers, setActiveToolId } = state;

    if (args.code == "Enter" || args.code == "Escape") {
      setProjectionSelection(undefined);

      const pixels = new Map<string, Map<number, UndoPixel>>();

      for (const layer of layers) {
        if (!layer.active) continue;

        if (layer.temporaryLayer) {
          layer.pixels =
            args.code == "Enter"
              ? layer.temporaryLayer.pixels
              : layer.temporaryLayer.pixelsCopy;

          pixels.set(layer.id, new Map<number, UndoPixel>());
          const pixelsData = pixels.get(layer.id);
          if (pixelsData) {
            for (let i = 0; i < layer.pixels.length / 4; i++) {
              const r = layer.pixels[i * 4];
              const g = layer.pixels[i * 4 + 1];
              const b = layer.pixels[i * 4 + 2];
              const a = layer.pixels[i * 4 + 3];

              pixelsData.set(i, { r, g, b, a });
            }
          }

          layer.temporaryLayer = undefined;
        }
      }

      if (args.code == "Enter") {
        addUndoAction(state, new ProjectionAction(pixels));
      }

      setActiveToolId("brush");
    }
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    const {} = state;
  }

  onUnselect(state: PaintContextType): void {
    const { setProjectionSelection, layers } = state;

    setProjectionSelection(undefined);

    for (const layer of layers) {
      if (!layer.active) continue;

      if (layer.temporaryLayer) {
        layer.pixels = layer.temporaryLayer.pixelsCopy;
        layer.temporaryLayer = undefined;
      }
    }
  }
}

export default ProjectionSelectTool;
