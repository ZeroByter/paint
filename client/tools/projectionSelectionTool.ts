import { clamp, getDistance } from "@client/utils";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";
import { PaintContextType } from "components/contexts/paint";
import { projectImage } from "components/paint/projectionSelection/projectionSelectionMagic";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

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
