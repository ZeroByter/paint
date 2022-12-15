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
    const { setSelection, mouseLoc, setSelectionClickability } = state;

    setSelection(new Selection(0, 0, 0, 0));

    this.dragStartLocation = mouseLoc.copy();
    setSelectionClickability(1);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { mouseLoc, setSelection } = state;

    const offset = mouseLoc.minus(this.dragStartLocation);

    setSelection(
      new Selection(
        Math.min(this.dragStartLocation.x, this.dragStartLocation.x + offset.x),
        Math.min(this.dragStartLocation.y, this.dragStartLocation.y + offset.y),
        Math.abs(offset.x),
        Math.abs(offset.y)
      )
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
