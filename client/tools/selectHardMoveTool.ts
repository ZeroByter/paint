import HardMoveAction from "@client/undo/hardMoveAction";
import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { addUndoAction, getRealScale } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";

class SelectHardMoveTool extends SelectMoveTool {
  sourceX = -1;
  sourceY = -1;

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
  ): void {
    super.onSelectMove(state, selectionStartPos, offset);

    const { setSelection, selection, width, height, layers } = state;
    const scale = getRealScale(state);

    if (!selection.isValid()) return;

    for (const layer of layers) {
      if (!layer.active) continue;

      if (!layer.temporaryLayer) continue;

      //moving temporaryLayer of each active layer
      layer.temporaryLayer.x = clamp(
        selectionStartPos.x + Math.round(offset.x / scale),
        0,
        width - selection.width
      );
      layer.temporaryLayer.y = clamp(
        selectionStartPos.y + Math.round(offset.y / scale),
        0,
        height - selection.height
      );
    }

    //moving selection
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

  onSelect(state: PaintContextType): void {
    super.onSelect(state);

    const { layers, selection } = state;

    if (!selection.isValid()) return;

    this.sourceX = selection.x;
    this.sourceY = selection.y;

    for (const layer of layers) {
      if (!layer.active) continue;

      layer.createTemporaryLayer(
        selection.width,
        selection.height,
        selection.x,
        selection.y
      );

      for (let y = 0; y < selection.height; y++) {
        for (let x = 0; x < selection.width; x++) {
          layer.setPixelData(selection.x + x, selection.y + y, 0, 0, 0, 0);
        }
      }
      layer.updatePixels();
    }
  }

  onUnselect(state: PaintContextType): void {
    super.onUnselect(state);

    const { layers, selection } = state;

    const layerIds: string[] = [];

    for (const layer of layers) {
      if (!layer.temporaryLayer) continue;

      layerIds.push(layer.id);

      layer.temporaryLayer.pasteOntoLayer();

      layer.temporaryLayer = undefined;
    }

    addUndoAction(
      state,
      new HardMoveAction(
        layerIds,
        selection.width,
        selection.height,
        this.sourceX,
        this.sourceY,
        selection.x,
        selection.y
      )
    );
  }
}

export default SelectHardMoveTool;
