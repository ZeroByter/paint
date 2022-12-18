import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class SelectTool extends Tool {
  dragStartLocation = new Location();

  constructor() {
    super();

    this.text = "S";
    this.tooltip = "Select";
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { setSelection, mouseLoc, setSelectionClickability, width, height } =
      state;

    setSelection(new Selection(0, 0, 0, 0));

    this.dragStartLocation = mouseLoc.copy();
    this.dragStartLocation.x = clamp(this.dragStartLocation.x, 0, width);
    this.dragStartLocation.y = clamp(this.dragStartLocation.y, 0, height);
    setSelectionClickability(1);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { mouseLoc, setSelection, width, height } = state;

    const newMouseLoc = mouseLoc.copy();
    newMouseLoc.x = clamp(newMouseLoc.x, 0, width);
    newMouseLoc.y = clamp(newMouseLoc.y, 0, height);

    const offset = newMouseLoc.minus(this.dragStartLocation);

    const newWidth = Math.min(
      this.dragStartLocation.x,
      this.dragStartLocation.x + offset.x
    );
    const newHeight = Math.min(
      this.dragStartLocation.y,
      this.dragStartLocation.y + offset.y
    );

    setSelection(
      new Selection(newWidth, newHeight, Math.abs(offset.x), Math.abs(offset.y))
    );
  }

  onMouseUp(state: PaintContextType, args: OnClickArgs): void {
    const { setSelectionClickability } = state;
    setSelectionClickability(2);
  }

  onSelect(state: PaintContextType): void {
    const { setSelectionClickability } = state;

    setSelectionClickability(2);
  }

  onUnselect(state: PaintContextType): void {
    const { setSelectionClickability } = state;

    setSelectionClickability(0);
  }
}

export default SelectTool;
