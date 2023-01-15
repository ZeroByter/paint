import Selection from "@shared/types/selection";
import { addColors } from "@client/layersToImageData";
import CropAction from "@client/undo/cropAction";
import UndoAction from "@client/undo/undoAction";
import { ilerp, lerp } from "@client/utils";
import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType } from "./paint";
import { UndoPixel } from "@client/undo/pencilAction";
import { randomString } from "@shared/utils";

export const scaleToSize = (
  state: PaintContextType,
  width: number,
  height: number
) => {
  const a = window.innerWidth / width;
  const b = (window.innerHeight - 31 - 60) / height; //TODO: 31 is a bad hard-wired variable, need to make this actually dynamic based on canvas's available size!
  state.setScale(ilerp(0.25, 1600, Math.min(b, a)));
};

export const loadFromImage = (
  state: PaintContextType,
  image: HTMLImageElement
) => {
  state.setWidth(image.width);
  state.setHeight(image.height);

  const newLayer = new Layer(image.width, image.height, true);
  newLayer.setPixelDataFromImage(image);
  newLayer.createPixelsCopy();

  state.setLayers([newLayer]);

  state.setOffset(new Location());

  scaleToSize(state, image.width, image.height);
};

export const getRealScale = (
  state: PaintContextType,
  scaleOverride?: number
) => {
  return lerp(0.25, 1600, scaleOverride ?? state.scale);
};

export const setActiveLayers = (state: PaintContextType, ids: string[]) => {
  const newLayers = [...state.layers];
  for (const layer of newLayers) {
    layer.active = ids.includes(layer.id);
  }
  state.setLayers(newLayers);
};

export const setVisibleLayers = (state: PaintContextType, ids: string[]) => {
  for (const layer of state.layers) {
    layer.visible = ids.includes(layer.id);
  }
};

export const addPixelColor = (
  state: PaintContextType,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
  update = false,
  layersCopy?: Layer[]
) => {
  const { layers, width, height, selection } = state;

  if (layersCopy == null) {
    layersCopy = [...layers];
  }

  const newColorPerLayer: { [id: string]: Color } = {};
  for (const layer of layersCopy) {
    newColorPerLayer[layer.id] = new Color(0, 0, 0, 0);
  }

  if (!canAffectPixel(state, x, y)) {
    return newColorPerLayer;
  }

  for (const layer of layersCopy) {
    if (!layer.active) continue;

    const currentColor = layer.getPixelColor(x, y);

    const combined = addColors(
      r,
      g,
      b,
      a,
      currentColor.r,
      currentColor.g,
      currentColor.b,
      currentColor.a
    );

    layer.setPixelData(x, y, combined.r, combined.g, combined.b, combined.a);
    if (update) layer.updatePixels();
  }

  if (layersCopy == null) {
    state.setLayers(layersCopy);
  }

  for (const layer of layersCopy) {
    newColorPerLayer[layer.id] = layer.getPixelColor(x, y);
  }

  return newColorPerLayer;
};

export const setPixelColor = (
  state: PaintContextType,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
  update = false
) => {
  const { width, height, selection } = state;

  if (!canAffectPixel(state, x, y)) return;

  const layersCopy = [...state.layers];

  for (const layer of layersCopy) {
    if (!layer.active) continue;

    layer.setPixelData(x, y, r, g, b, a);
    if (update) layer.updatePixels();
  }

  state.setLayers(layersCopy);
};

export const erasePixel = (
  state: PaintContextType,
  x: number,
  y: number,
  opacity: number,
  update = false
) => {
  const { layers } = state;

  if (!canAffectPixel(state, x, y)) return;

  for (const layer of layers) {
    if (!layer.active) continue;

    const color = layer.getPixelColor(x, y);
    layer.setPixelData(
      x,
      y,
      color.r,
      color.g,
      color.b,
      Math.min(0, opacity - color.a)
    );
    if (update) layer.updatePixels();
  }
};

export const updateActiveLayers = (state: PaintContextType) => {
  for (const layer of state.layers) {
    if (!layer.active) continue;

    layer.updatePixels();
  }
};

export const isMouseInsideImage = (state: PaintContextType) => {
  const { mouseLoc, width, height } = state;

  return (
    mouseLoc.x >= 0 &&
    mouseLoc.y >= 0 &&
    mouseLoc.x < width &&
    mouseLoc.y < height
  );
};

export const addUndoAction = (state: PaintContextType, action: UndoAction) => {
  state.redoActions = [];
  state.undoActions.push(action);
};

export const undoAction = (state: PaintContextType) => {
  const undoAction = state.undoActions.pop();
  if (!undoAction) return false;

  undoAction.undo(state);

  state.redoActions.push(undoAction);

  return true;
};

export const redoAction = (state: PaintContextType) => {
  const redoAction = state.redoActions.pop();
  if (!redoAction) return false;

  redoAction.redo(state);

  state.undoActions.push(redoAction);

  return true;
};

export const cropToSelection = (
  state: PaintContextType,
  selection: Selection,
  shouldAddUndoAction = true
) => {
  const { layers, width, height } = state;

  if (!state.selection.isValid()) return;

  if (shouldAddUndoAction) {
    addUndoAction(
      state,
      new CropAction(
        layers.map((layer) => ({ id: layer.id, pixels: layer.pixels })),
        width,
        height,
        selection
      )
    );
  }

  for (const layer of layers) {
    const newPixels = new Uint8ClampedArray(
      selection.width * selection.height * 4
    );

    for (let y = 0; y < selection.height; y++) {
      for (let x = 0; x < selection.width; x++) {
        const oldIndex = (selection.x + x + (selection.y + y) * width) * 4;
        const newIndex = (x + y * selection.width) * 4;

        newPixels[newIndex] = layer.pixels[oldIndex];
        newPixels[newIndex + 1] = layer.pixels[oldIndex + 1];
        newPixels[newIndex + 2] = layer.pixels[oldIndex + 2];
        newPixels[newIndex + 3] = layer.pixels[oldIndex + 3];
      }
    }

    layer.pixels = newPixels;

    layer.width = selection.width;
    layer.height = selection.height;
  }

  state.setWidth(selection.width);
  state.setHeight(selection.height);

  state.setSelection(new Selection());
};

export const getUndoPixelColor = (
  state: PaintContextType,
  layerId: string,
  x: number,
  y: number
) => {
  for (let i = 0; i < state.undoActions.length; i++) {
    const undoAction = state.undoActions[state.undoActions.length - i - 1];

    const pixels = (undoAction as any).pixels as
      | Map<string, Map<number, UndoPixel>>
      | undefined;

    if (pixels) {
      const data = pixels.get(layerId);
      if (data) {
        const undoPixel = data.get(x + y * state.width);
        if (undoPixel) {
          return undoPixel;
        }
      }
    }
  }

  const pixelsCopy = state.layers.find(
    (layer) => layer.id == layerId
  )?.pixelsCopy;

  if (pixelsCopy) {
    const index = x + y * state.width;

    return {
      r: pixelsCopy[index * 4],
      g: pixelsCopy[index * 4 + 1],
      b: pixelsCopy[index * 4 + 2],
      a: pixelsCopy[index * 4 + 3],
    };
  }

  return {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  };
};

export const setNotification = (
  state: PaintContextType,
  text: string,
  image?: ImageData
) => {
  state.setNotificationData({
    id: randomString(),
    text,
    image,
  });
};

export const canAffectPixel = (
  state: PaintContextType,
  x: number,
  y: number
) => {
  if (x < 0 || y < 0 || x > state.width - 1 || y > state.height - 1) {
    return false;
  }

  if (state.selection.isValid()) {
    if (
      x < state.selection.x ||
      y < state.selection.y ||
      x > state.selection.x + state.selection.width - 1 ||
      y > state.selection.y + state.selection.height - 1
    ) {
      return false;
    }
  }

  return true;
};