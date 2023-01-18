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

  onSelect(state: PaintContextType): void {
    const { layers, selection } = state;

    if (!selection.isValid()) return;

    for (const layer of layers) {
      if (!layer.active) continue;

      layer.createTemporaryLayer(
        selection.width,
        selection.height,
        selection.x,
        selection.y
      );
    }
  }

  onUnselect(state: PaintContextType): void {
    const { layers } = state;

    for (const layer of layers) {
      layer.temporaryLayer = undefined;
    }
  }
}

export default SelectHardMoveTool;
