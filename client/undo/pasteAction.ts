import { PaintContextType } from "components/contexts/paint";
import {
  addUpdateCallbacks,
  createNewLayerAt,
  deleteLayerById,
  loadFromImage,
  setActiveLayers,
} from "components/contexts/paintUtils";
import UndoAction from "./undoAction";

export default class PasteAction extends UndoAction {
  newLayerId: string;
  newLayerName: string;
  newLayerActive: boolean;
  newLayerVisible: boolean;

  newLayerPixels: Uint8ClampedArray;
  lastActiveLayer: number;

  constructor(
    newLayerId: string,
    newLayerName: string,
    newLayerActive: boolean,
    newLayerVisible: boolean,
    newLayerPixels: Uint8ClampedArray,
    lastActiveLayer: number
  ) {
    super();

    this.newLayerId = newLayerId;
    this.newLayerName = newLayerName;
    this.newLayerActive = newLayerActive;
    this.newLayerVisible = newLayerVisible;
    this.newLayerPixels = newLayerPixels;
    this.lastActiveLayer = lastActiveLayer;
  }

  undo(state: PaintContextType): void {
    deleteLayerById(state, this.newLayerId);
  }

  redo(state: PaintContextType): void {
    addUpdateCallbacks(state, [
      (state: PaintContextType) => {
        const newLayer = createNewLayerAt(state, this.lastActiveLayer + 1);
        newLayer.id = this.newLayerId;
        newLayer.name = this.newLayerName;
        newLayer.pixels = this.newLayerPixels;
        newLayer.createPixelsCopy();
      },
      (state: PaintContextType) => {
        setActiveLayers(state, [this.newLayerId]);
      },
    ]);
  }
}
