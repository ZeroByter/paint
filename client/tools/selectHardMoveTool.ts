import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";

class SelectHardMoveTool extends SelectMoveTool {
  constructor() {
    super();

    this.text = "HM";
    this.tooltip = "Select";
    this.editingState = "EDITING_HARD";
  }

  onSelectMove(
    state: PaintContextType,
    selectionStartPos: Location,
    offset: Location
  ): void {}
}

export default SelectHardMoveTool;
