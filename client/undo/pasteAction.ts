import Layer from "@shared/types/layer";
import { PaintContextType } from "components/contexts/paint";
import {
  addUpdateCallbacks,
  createNewLayerAt,
  deleteLayerById,
  loadFromImage,
  loadOntoNewLayer,
  setActiveLayers,
} from "components/contexts/paintUtils";
import UndoAction from "./undoAction";

export default class PasteAction extends UndoAction {
  newLayerId: string;
  newLayerName: string;
  newLayerActive: boolean;
  newLayerVisible: boolean;

  newLayerPixels: Uint8ClampedArray;

  imageWidth: number;
  imageHeight: number;

  lastActiveLayer: number;

  constructor(
    newLayerId: string,
    newLayerName: string,
    newLayerActive: boolean,
    newLayerVisible: boolean,
    newLayerPixels: Uint8ClampedArray,
    imageWidth: number,
    imageHeight: number,
    lastActiveLayer: number
  ) {
    super();

    this.newLayerId = newLayerId;
    this.newLayerName = newLayerName;
    this.newLayerActive = newLayerActive;
    this.newLayerVisible = newLayerVisible;
    this.newLayerPixels = newLayerPixels;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.lastActiveLayer = lastActiveLayer;
  }

  undo(state: PaintContextType): void {
    deleteLayerById(state, this.newLayerId);
  }

  redo(state: PaintContextType): void {
    addUpdateCallbacks(state, [
      (state: PaintContextType) => {
        const newLayer = loadOntoNewLayer(
          state,
          this.imageWidth,
          this.imageHeight,
          this.newLayerPixels
        );
        newLayer.id = this.newLayerId;
        newLayer.name = this.newLayerName;
        newLayer.temporaryLayer!.pasteOntoLayer();
        newLayer.temporaryLayer = undefined;
        newLayer.createPixelsCopy();
      },
      (state: PaintContextType) => {
        setActiveLayers(state, [this.newLayerId]);
      },
    ]);
  }
}
