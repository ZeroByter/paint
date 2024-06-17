import Selection from "@shared/types/selection";
import { addColors } from "@client/layersToImageData";
import CropAction from "@client/undo/cropAction";
import UndoAction from "@client/undo/undoAction";
import { ilerp, lerp } from "@client/utils";
import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import { PaintContextType, UpdateCallback } from "./paint";
import { randomString } from "@shared/utils";
import { getUndoPixelColorType } from "@client/undo/undoPixelColor";
import Tools, { ToolTypes } from "@client/tools";

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

export const loadOntoNewLayer = (
  state: PaintContextType,
  width: number,
  height: number,
  pixels?: Uint8ClampedArray
) => {
  const { layers } = state;

  let lastActiveLayer = 0;
  for (const index in layers) {
    const layer = layers[index];
    const indexNumber = parseInt(index);

    if (!layer.active) continue;

    if (indexNumber > lastActiveLayer) {
      lastActiveLayer = indexNumber;
    }
  }

  const newLayer = createNewLayerAt(state, lastActiveLayer + 1);
  const newTempLayer = newLayer.createTemporaryLayer(width, height, 0, 0);

  if (pixels) {
    newTempLayer.pixels = pixels;
  }

  return newLayer;
};

export const loadOntoNewLayerImage = (
  state: PaintContextType,
  image: HTMLImageElement
) => {
  const newLayer = loadOntoNewLayer(state, image.width, image.height);

  newLayer.temporaryLayer!.setPixelDataFromImage(image);

  return newLayer;
};

export const getRealScale = (
  state: PaintContextType,
  scaleOverride?: number
) => {
  return lerp(0.25, 1600, scaleOverride ?? state.scale);
};

export const setActiveLayers = (
  state: PaintContextType,
  ids: string[],
  overrideLayers?: Layer[]
) => {
  const newLayers = overrideLayers ?? [...state.layers];
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
  state.redoActions.current = [];
  state.undoActions.current.push(action);

  state.setUndoRedoId(randomString());
};

export const undoAction = (state: PaintContextType) => {
  const undoAction = state.undoActions.current.pop();
  if (!undoAction) return false;

  undoAction.undo(state);

  state.redoActions.current.push(undoAction);

  state.setUndoRedoId(randomString());

  return true;
};

export const redoAction = (state: PaintContextType) => {
  const redoAction = state.redoActions.current.pop();
  if (!redoAction) return false;

  redoAction.redo(state);

  state.undoActions.current.push(redoAction);

  state.setUndoRedoId(randomString());

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

  state.setProjectionSelection(undefined);
  state.setSelection(new Selection());
};

export const getUndoPixelColor = (
  state: PaintContextType,
  layerId: string,
  x: number,
  y: number,
  skipActions = 0
) => {
  for (let i = 0; i < state.undoActions.current.length; i++) {
    const undoAction =
      state.undoActions.current[
      state.undoActions.current.length - i - 1 - skipActions
      ];

    if (!undoAction) break;

    const getUndoPixelColorFunc: getUndoPixelColorType | undefined = (
      undoAction as any
    ).getUndoPixelColor;

    if (getUndoPixelColorFunc) {
      const undoPixel = getUndoPixelColorFunc.call(
        undoAction,
        state,
        layerId,
        x,
        y
      );
      if (undoPixel) {
        return undoPixel;
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

export const setPrompt = (state: PaintContextType, text: string, buttons: string[]): Promise<number> => {
  return new Promise(resolve => {
    state.setPromptData({
      text,
      buttons,
      callback: resolve
    })
  })
}

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

export const selectTool = (
  state: PaintContextType,
  id: ToolTypes,
  autoOnSelect = true
) => {
  Tools[state.activeToolId].onUnselect(state);

  state.setActiveToolId(id);

  if (autoOnSelect) {
    Tools[id].onSelect(state);
  }
};

export const createNewLayer = (state: PaintContextType) => {
  const { layers, setLayers, width, height } = state;

  const newLayer = new Layer(width, height, false);

  const newLayers = [...layers];
  newLayers.push(newLayer);
  setLayers(newLayers);

  return newLayer;
};

export const createNewLayerAt = (
  state: PaintContextType,
  afterIndex: number
) => {
  const { layers, setLayers, width, height } = state;

  const newLayer = new Layer(width, height, false);

  const newLayers = [...layers];
  newLayers.splice(afterIndex, 0, newLayer);
  setLayers(newLayers);

  return newLayer;
};

export const deleteLayerById = (state: PaintContextType, id: string) => {
  const { layers, setLayers } = state;

  setLayers(layers.filter((layer) => layer.id != id));
};

export const addUpdateCallbacks = (
  state: PaintContextType,
  callbacks: UpdateCallback[]
) => {
  const { updateCallbacks, setUpdateCallbacks } = state;

  setUpdateCallbacks([...updateCallbacks, ...callbacks]);
};

export const resize = (state: PaintContextType, newWidth: number, newHeight: number) => {
  for (const layer of state.layers) {
    layer.resize(state.width, state.height, newWidth, newHeight)
    layer.temporaryLayer?.resize(state.width, state.height, newWidth, newHeight)
  }

  state.setWidth(newWidth)
  state.setHeight(newHeight)

  state.setProjectionSelection(undefined);
  state.setSelection(new Selection());
}
