import Tools from "@client/tools";
import Tool from "@client/tools/tool";
import CropAction, { CroppedLayer } from "@client/undo/cropAction";
import UndoAction from "@client/undo/undoAction";
import { ilerp, lerp } from "@client/utils";
import Color from "@shared/types/color";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { randomString } from "@shared/utils";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

export type PaintContextType = {
  width: number;
  setWidth: (newWidth: number) => void;
  height: number;
  setHeight: (newHeight: number) => void;

  offset: Location;
  setOffset: (newOffset: Location) => void;

  scale: number;
  setScale: (newScale: number) => void;

  mouseLoc: Location;
  setMouseLoc: (newLoc: Location) => void;
  mouseScaledLoc: Location;
  setMouseScaledLoc: (newLoc: Location) => void;

  layers: Layer[];
  setLayers: (newScale: Layer[]) => void;

  setActiveLayers: (ids: string[]) => void;
  setVisibleLayers: (ids: string[]) => void;

  primaryColor: Color;
  setPrimaryColor: (newColor: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (newColor: Color) => void;
  lastColorChanged: 0 | 1;
  setLastColorChanged: (newIndex: 0 | 1) => void;

  selection: Selection;
  setSelection: (newSelection: Selection) => void;
  selectionClickability: number;
  setSelectionClickability: (newClickability: number) => void;

  activeToolId: string;
  setActiveToolId: (newToolId: string) => void;

  loadFromImage: (image: HTMLImageElement) => void;

  getRealScale: (number?: number) => number;

  setPixelColor: (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    update: boolean
  ) => void;

  erasePixel: (x: number, y: number, opacity: number, update: boolean) => void;

  updateActiveLayers: () => void;

  isMouseInsideImage: () => boolean;

  addUndoAction: (action: UndoAction) => void;
  undoAction: () => void;
  redoAction: () => void;

  cropToSelection: (
    selection: Selection,
    shouldAddUndoAction?: boolean
  ) => void;

  notificationData?: NotificationData;
  setNotification: (text: string, image?: ImageData) => void;
};

export const PaintContext = createContext<PaintContextType>(
  {} as PaintContextType
);

type Props = {
  children: ReactNode;
};

type NotificationData = {
  id: string;
  text: string;
  image?: ImageData;
};

const PaintProvider: FC<Props> = ({ children }) => {
  const undoActions = useRef<UndoAction[]>([]);
  const redoActions = useRef<UndoAction[]>([]);

  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  const [offset, setOffset] = useState(new Location());

  const [scale, setScale] = useState(ilerp(0.25, 1600, 10));

  const [mouseLoc, setMouseLoc] = useState(new Location());
  const [mouseScaledLoc, setMouseScaledLoc] = useState(new Location());

  const [layers, setLayers] = useState<Layer[]>([]);

  const [primaryColor, setPrimaryColor] = useState<Color>(
    new Color(0, 0, 0, 255)
  );
  const [secondaryColor, setSecondaryColor] = useState<Color>(
    new Color(255, 255, 255, 255)
  );
  const [lastColorChanged, setLastColorChanged] = useState<0 | 1>(0);

  const [selection, setSelection] = useState(new Selection(0, 0, 0, 0));
  const [selectionClickability, setSelectionClickability] = useState(0);

  const [activeToolId, setActiveToolId] = useState("pencil");

  const [notificationData, setNotificationData] = useState<NotificationData>();

  const loadFromImage = (image: HTMLImageElement) => {
    setWidth(image.width);
    setHeight(image.height);

    const newLayer = new Layer(image.width, image.height, true);
    newLayer.setPixelDataFromImage(image);

    setLayers([newLayer]);

    setOffset(new Location());

    const a = window.innerWidth / image.width;
    const b = (window.innerHeight - 31 - 60) / image.height; //TODO: 31 is a bad hard-wired variable, need to make this actually dynamic based on canvas's available size!
    setScale(ilerp(0.25, 1600, Math.min(b, a)));
  };

  const getRealScale = (scaleOverride?: number) => {
    return lerp(0.25, 1600, scaleOverride ?? scale);
  };

  const setActiveLayers = (ids: string[]) => {
    const newLayers = [...layers];
    for (const layer of newLayers) {
      layer.active = ids.includes(layer.id);
    }
    setLayers(newLayers);
  };

  const setVisibleLayers = (ids: string[]) => {
    for (const layer of layers) {
      layer.visible = ids.includes(layer.id);
    }
  };

  const setPixelColor = (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    update = false
  ) => {
    if (x < 0 || y < 0 || x > width - 1 || y > height - 1) return;

    if (selection.isValid()) {
      if (
        x < selection.x ||
        y < selection.y ||
        x > selection.x + selection.width - 1 ||
        y > selection.y + selection.height - 1
      ) {
        return;
      }
    }

    for (const layer of layers) {
      if (!layer.active) continue;

      layer.setPixelData(x, y, r, g, b, a);
      if (update) layer.updatePixels();
    }
  };

  const erasePixel = (
    x: number,
    y: number,
    opacity: number,
    update = false
  ) => {
    if (x < 0 || y < 0 || x > width - 1 || y > height - 1) return;

    if (selection.isValid()) {
      if (
        x < selection.x ||
        y < selection.y ||
        x > selection.x + selection.width - 1 ||
        y > selection.y + selection.height - 1
      ) {
        return;
      }
    }

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

  const updateActiveLayers = () => {
    for (const layer of layers) {
      if (!layer.active) continue;

      layer.updatePixels();
    }
  };

  const isMouseInsideImage = () => {
    return (
      mouseLoc.x >= 0 &&
      mouseLoc.y >= 0 &&
      mouseLoc.x < width &&
      mouseLoc.y < height
    );
  };

  const addUndoAction = (action: UndoAction) => {
    redoActions.current = [];
    undoActions.current.push(action);
  };

  const undoAction = () => {
    const undoAction = undoActions.current.pop();
    if (!undoAction) return;

    undoAction.undo(stateValue);

    redoActions.current.push(undoAction);
  };

  const redoAction = () => {
    const redoAction = redoActions.current.pop();
    if (!redoAction) return;

    redoAction.redo(stateValue);

    undoActions.current.push(redoAction);
  };

  const cropToSelection = (
    selection: Selection,
    shouldAddUndoAction = true
  ) => {
    if (!selection.isValid()) return;

    if (shouldAddUndoAction) {
      addUndoAction(
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

    setWidth(selection.width);
    setHeight(selection.height);

    setSelection(new Selection());
  };

  const setNotification = (text: string, image?: ImageData) => {
    setNotificationData({
      id: randomString(),
      text,
      image,
    });
  };

  const stateValue = {
    width,
    setWidth,
    height,
    setHeight,
    offset,
    setOffset,
    scale,
    setScale,
    mouseLoc,
    setMouseLoc,
    mouseScaledLoc,
    setMouseScaledLoc,
    layers,
    setLayers,
    setActiveLayers,
    setVisibleLayers,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    lastColorChanged,
    setLastColorChanged,
    selection,
    setSelection,
    selectionClickability,
    setSelectionClickability,
    activeToolId,
    setActiveToolId,
    loadFromImage,
    getRealScale,
    setPixelColor,
    erasePixel,
    updateActiveLayers,
    isMouseInsideImage,
    addUndoAction,
    undoAction,
    redoAction,
    cropToSelection,
    notificationData,
    setNotification,
  };

  return (
    <PaintContext.Provider value={stateValue}>{children}</PaintContext.Provider>
  );
};
export default PaintProvider;

export const PaintFetcher = () => {
  return useContext(PaintContext);
};
