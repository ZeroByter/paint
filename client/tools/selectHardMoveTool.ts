import HardMoveAction from "@client/undo/hardMoveAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import {
  addUndoAction,
  getRealScale,
  selectTool,
} from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";
import Selection from "@shared/types/selection";

class SelectHardMoveTool extends SelectMoveTool {
  sourceX = -1;
  sourceY = -1;

  forceSelection?: Selection;

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

    const useSelection = this.forceSelection ?? selection;

    if (!useSelection.isValid()) return;

    for (const layer of layers) {
      if (!layer.active) continue;

      if (!layer.temporaryLayer) continue;

      //moving temporaryLayer of each active layer
      layer.temporaryLayer.x = clamp(
        selectionStartPos.x + Math.round(offset.x / scale),
        0,
        width - useSelection.width
      );
      layer.temporaryLayer.y = clamp(
        selectionStartPos.y + Math.round(offset.y / scale),
        0,
        height - useSelection.height
      );
    }

    //moving selection
    setSelection(
      useSelection.newLocation(
        new Location(
          clamp(
            selectionStartPos.x + Math.round(offset.x / scale),
            0,
            width - useSelection.width
          ),
          clamp(
            selectionStartPos.y + Math.round(offset.y / scale),
            0,
            height - useSelection.height
          )
        )
      )
    );
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

    for (const layer of layers) {
      if (!layer.active) continue;

      layer.createTemporaryLayer(
        useSelection.width,
        useSelection.height,
        useSelection.x,
        useSelection.y
      );

      for (let y = 0; y < useSelection.height; y++) {
        for (let x = 0; x < useSelection.width; x++) {
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

  onUnselect(state: PaintContextType): void {
    super.onUnselect(state);

    const { layers, selection } = state;

    const useSelection = this.forceSelection ?? selection;

    const pixels = new Map<string, Map<number, UndoPixel>>();

    for (const layer of layers) {
      if (!layer.temporaryLayer) continue;

      pixels.set(layer.id, new Map<number, UndoPixel>());
      layer.temporaryLayer.pasteOntoLayer();

      for (let y = 0; y < useSelection.height; y++) {
        for (let x = 0; x < useSelection.width; x++) {
          const pixel = layer.getPixelColor(
            useSelection.x + x,
            useSelection.y + y
          );
          pixels.get(layer.id)?.set(x + y * useSelection.width, pixel);
        }
      }

      layer.temporaryLayer = undefined;
    }

    addUndoAction(
      state,
      new HardMoveAction(
        pixels,
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
