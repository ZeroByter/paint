import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import ProjectionSelection from "@shared/types/projectionSelection";
import { PaintContextType } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class ProjectionSelectTool extends Tool {
  dragStartLocation = new Location();

  constructor() {
    super();

    this.text = "PS";
    this.tooltip = "Projection Select";
    this.hidden = true;
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { mouseLoc, setSelectionClickability, width, height } = state;

    this.dragStartLocation = mouseLoc.copy();
    this.dragStartLocation.x = clamp(this.dragStartLocation.x, 0, width);
    this.dragStartLocation.y = clamp(this.dragStartLocation.y, 0, height);
    setSelectionClickability("CREATING");
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { mouseLoc, setProjectionSelection, width, height } = state;

    const newMouseLoc = mouseLoc.copy();
    newMouseLoc.x = clamp(newMouseLoc.x, 0, width);
    newMouseLoc.y = clamp(newMouseLoc.y, 0, height);

    setProjectionSelection(
      new ProjectionSelection(
        this.dragStartLocation.x,
        this.dragStartLocation.y,
        newMouseLoc.x,
        this.dragStartLocation.y,
        this.dragStartLocation.x,
        newMouseLoc.y,
        newMouseLoc.x,
        newMouseLoc.y
      )
    );
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    const { setSelectionClickability } = state;
    setSelectionClickability("CREATING");
  }

  onSelect(state: PaintContextType): void {
    const { setSelectionClickability } = state;

    setSelectionClickability("CREATING");
  }

  onUnselect(state: PaintContextType): void {
    const { setSelectionClickability, setProjectionSelection } = state;

    setSelectionClickability("WORKING");
    setProjectionSelection(undefined);
  }
}

export default ProjectionSelectTool;
