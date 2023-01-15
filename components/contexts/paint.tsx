import { addColors } from "@client/layersToImageData";
import Tools from "@client/tools";
import Tool from "@client/tools/tool";
import CropAction, { CroppedLayer } from "@client/undo/cropAction";
import { UndoPixel } from "@client/undo/pencilAction";
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

export type ColorPerLayer = {
  [id: string]: Color;
};

export type PaintContextType = {
  undoActions: UndoAction[];
  redoActions: UndoAction[];

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

  brushSize: number;
  setBrushSize: (newSize: number) => void;
  brushHardness: number;
  setBrushHardness: (newHardness: number) => void;

  notificationData?: NotificationData;
  setNotificationData: (newData: NotificationData) => void;
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

  const [activeToolId, setActiveToolId] = useState("brush");

  const [brushSize, setBrushSize] = useState(3);
  const [brushHardness, setBrushHardness] = useState(0.5);

  const [notificationData, setNotificationData] = useState<NotificationData>();

  const stateValue = {
    undoActions: undoActions.current,
    redoActions: undoActions.current,
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
    brushSize,
    setBrushSize,
    brushHardness,
    setBrushHardness,
    notificationData,
    setNotificationData,
  };

  return (
    <PaintContext.Provider value={stateValue}>{children}</PaintContext.Provider>
  );
};
export default PaintProvider;

export const PaintFetcher = () => {
  return useContext(PaintContext);
};
