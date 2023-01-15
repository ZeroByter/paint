import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class SelectSoftMoveTool extends SelectMoveTool {
  constructor() {
    super();

    this.text = "SM";
    this.tooltip = "Select";
    this.editingState = "EDITING";
  }

  onSelectMove(
    state: PaintContextType,
    selectionStartPos: Location,
    offset: Location
  ): void {
    const { setSelection, selection, width, height } = state;
    const scale = getRealScale(state);

    setSelection(
      selection.newLocation(
        new Location(
          clamp(
            selectionStartPos.x + Math.round(offset.x / scale),
            0,
            width - selection.width
          ),
          clamp(
            selectionStartPos.y + Math.round(offset.y / scale),
            0,
            height - selection.height
          )
        )
      )
    );
  }
}

export default SelectSoftMoveTool;
