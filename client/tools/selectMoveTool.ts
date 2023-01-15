import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import Selection, { SelectionClickability } from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class SelectMoveTool extends Tool {
  editingState: SelectionClickability = "EDITING";
  dragStartLocation = new Location();

  onSelect(state: PaintContextType): void {
    const { setSelectionClickability } = state;

    setSelectionClickability(this.editingState);
  }

  onUnselect(state: PaintContextType): void {
    const { setSelectionClickability } = state;

    setSelectionClickability("WORKING");
  }

  onSelectMove(
    state: PaintContextType,
    selectionStartPos: Location,
    offset: Location
  ): void {}
}

export default SelectMoveTool;
