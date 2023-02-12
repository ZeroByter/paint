import HardMoveAction from "@client/undo/hardMoveAction";
import { UndoPixel } from "@client/undo/undoPixelColor";
import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";
import { addUndoAction, getRealScale } from "components/contexts/paintUtils";
import SelectMoveTool from "./selectMoveTool";
import TemporaryLayer from "@shared/types/temporaryLayer";
import Layer from "@shared/types/layer";

class SelectHardMoveTool extends SelectMoveTool {
  sourceX = -1;
  sourceY = -1;

  pixels = new Map<string, Map<number, UndoPixel>>();

  existingTempLayer = false;

  constructor() {
    super();

    this.text = "HM";
    this.tooltip = "Hard Move";
    this.editingState = "EDITING_HARD";
  }

  onSelect(state: PaintContextType): void {
    super.onSelect(state);

    const { layers, selection } = state;

    if (!selection.isValid()) {
      return;
    }

    this.sourceX = selection.x;
    this.sourceY = selection.y;

    this.pixels = new Map<string, Map<number, UndoPixel>>();

    for (const layer of layers) {
      if (!layer.active) continue;

      this.pixels.set(layer.id, new Map<number, UndoPixel>());

      if (!this.existingTempLayer) {
        const newTempLayer = layer.createTemporaryLayer(
          selection.width,
          selection.height,
          selection.x,
          selection.y
        );
        newTempLayer.setPixelsFromLayer();
      }

      const useLayer = (
        this.existingTempLayer && layer.temporaryLayer
          ? layer.temporaryLayer
          : layer
      ) as Layer | TemporaryLayer;

      for (let y = 0; y < selection.height; y++) {
        for (let x = 0; x < selection.width; x++) {
          const pixel = useLayer.getPixelColor(
            selection.x + x,
            selection.y + y
          );
          this.pixels.get(layer.id)?.set(x + y * selection.width, pixel);

          layer.setPixelData(selection.x + x, selection.y + y, 0, 0, 0, 0);
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

    const { selection, setSelection, layers } = state;
    const scale = getRealScale(state);

    if (!selection.isValid()) return;

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
    setSelection(
      selection.newLocation(
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

    this.existingTempLayer = false;

    if (selection.isValid()) {
      for (const layer of layers) {
        if (!layer.temporaryLayer) continue;

        layer.temporaryLayer.pasteOntoLayer();
        layer.temporaryLayer = undefined;
      }

      addUndoAction(
        state,
        new HardMoveAction(
          this.pixels,
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
}

export default SelectHardMoveTool;
