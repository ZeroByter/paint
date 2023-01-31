import Location from "@shared/types/location";
import { SelectionClickability } from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import { selectTool } from "components/contexts/paintUtils";
import Tool, { OnKeyDownArgs } from "./tool";

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

  onKeyDown(state: PaintContextType, args: OnKeyDownArgs): void {
    if (args.code == "Enter" || args.code == "Escape") {
      selectTool(state, "brush");
    }
  }
}

export default SelectMoveTool;
