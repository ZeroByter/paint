import HardMoveAction from "@client/undo/hardMoveAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { addUndoAction, getRealScale } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";
import Selection from "@shared/types/selection";

class SelectHardMoveTool extends SelectMoveTool {
  sourceX = -1;
  sourceY = -1;

  forceSelection?: Selection;

  pixels = new Map<string, Map<number, UndoPixel>>();

  constructor() {
    super();

    this.text = "HM";
    this.tooltip = "Select";
    this.editingState = "EDITING_HARD";
  }

  customSetSelection(state: PaintContextType, newSelection: Selection) {
    if (this.forceSelection) {
      this.forceSelection = newSelection;
    }

    state.setSelection(newSelection);
  }

  onSelect(state: PaintContextType): void {
    super.onSelect(state);

    const { layers, selection } = state;

    const useSelection = this.forceSelection ?? selection;

    if (!useSelection.isValid()) {
      return;
    }

    this.sourceX = useSelection.x;
    this.sourceY = useSelection.y;

    this.pixels = new Map<string, Map<number, UndoPixel>>();

    for (const layer of layers) {
      if (!layer.active) continue;

      this.pixels.set(layer.id, new Map<number, UndoPixel>());

      const newTempLayer = layer.createTemporaryLayer(
        useSelection.width,
        useSelection.height,
        useSelection.x,
        useSelection.y
      );
      newTempLayer.setPixelsFromLayer();

      for (let y = 0; y < useSelection.height; y++) {
        for (let x = 0; x < useSelection.width; x++) {
          const pixel = layer.getPixelColor(
            useSelection.x + x,
            useSelection.y + y
          );
          this.pixels.get(layer.id)?.set(x + y * useSelection.width, pixel);

          layer.setPixelData(
            useSelection.x + x,
            useSelection.y + y,
            0,
            0,
            0,
            0
          );
        }
      }
      layer.updatePixels();
    }
  }

  onSelectMove(
    state: PaintContextType,
    selectionStartPos: Location,
    offset: Location
  ): void {
    super.onSelectMove(state, selectionStartPos, offset);

    const { selection, layers } = state;
    const scale = getRealScale(state);

    const useSelection = this.forceSelection ?? selection;

    if (!useSelection.isValid()) return;

    for (const layer of layers) {
      if (!layer.active) continue;

      if (!layer.temporaryLayer) continue;

      //moving temporaryLayer of each active layer
      layer.temporaryLayer.x =
        selectionStartPos.x + Math.round(offset.x / scale);
      layer.temporaryLayer.y =
        selectionStartPos.y + Math.round(offset.y / scale);
    }

    //moving selection
    this.customSetSelection(
      state,
      useSelection.newLocation(
        new Location(
          selectionStartPos.x + Math.round(offset.x / scale),
          selectionStartPos.y + Math.round(offset.y / scale)
        )
      )
    );
  }

  onUnselect(state: PaintContextType): void {
    super.onUnselect(state);

    const { layers, selection } = state;

    const useSelection = this.forceSelection ?? selection;

    for (const layer of layers) {
      if (!layer.temporaryLayer) continue;

      layer.temporaryLayer.pasteOntoLayer();
      layer.temporaryLayer = undefined;
    }

    addUndoAction(
      state,
      new HardMoveAction(
        this.pixels,
        useSelection.width,
        useSelection.height,
        this.sourceX,
        this.sourceY,
        useSelection.x,
        useSelection.y
      )
    );

    this.forceSelection = undefined;
  }
}

export default SelectHardMoveTool;
