import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { getRealScale, selectTool } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";

class SelectSoftMoveTool extends SelectMoveTool {
  constructor() {
    super();

    this.text = "SM";
    this.tooltip = "Soft Move";
    this.editingState = "EDITING";
  }

  onSelectMove(
    state: PaintContextType,
    selectionStartPos: Location,
    offset: Location
  ): void {
    const { setSelection, selection } = state;
    const scale = getRealScale(state);

    setSelection(
      selection.newLocation(
        new Location(
          selectionStartPos.x + Math.round(offset.x / scale),
          selectionStartPos.y + Math.round(offset.y / scale)
        )
      )
    );
  }
}

export default SelectSoftMoveTool;
