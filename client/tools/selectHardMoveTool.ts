import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintContextType } from "components/contexts/paint";
import SelectMoveTool from "./selectMoveTool";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class SelectHardMoveTool extends SelectMoveTool {
  constructor() {
    super();

    this.text = "HM";
    this.tooltip = "Select";
    this.editingState = "EDITING_HARD";
  }
}

export default SelectHardMoveTool;
