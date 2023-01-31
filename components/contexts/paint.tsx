import UndoAction from "@client/undo/undoAction";
import { ilerp } from "@client/utils";
import Color from "@shared/types/color";
import Layer from "@shared/types/layer";
import Location from "@shared/types/location";
import Selection, { SelectionClickability } from "@shared/types/selection";
import ProjectionSelection from "@shared/types/projectionSelection";
import Tools, { ToolTypes } from "@client/tools";
import {
  createContext,
  FC,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { randomString } from "@shared/utils";

export type ColorPerLayer = {
  [id: string]: Color;
};

export type PaintContextType = {
  updateCallbacks: UpdateCallback[];
  setUpdateCallbacks: (newCallbacks: UpdateCallback[]) => void;

  undoActions: MutableRefObject<UndoAction[]>;
  redoActions: MutableRefObject<UndoAction[]>;

  undoRedoId: string;
  setUndoRedoId: (newId: string) => void;

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
  freeMouseLoc: Location;
  setFreeMouseLoc: (newLoc: Location) => void;

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
  projectionSelection: ProjectionSelection | undefined;
  setProjectionSelection: (
    newSelection: ProjectionSelection | undefined
  ) => void;
  selectionClickability: SelectionClickability;
  setSelectionClickability: (newClickability: SelectionClickability) => void;

  activeToolId: ToolTypes;
  setActiveToolId: (newToolId: ToolTypes) => void;

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

export interface UpdateCallback {
  (param: PaintContextType): void;
}

const PaintProvider: FC<Props> = ({ children }) => {
  const [updateCallbacks, setUpdateCallbacks] = useState<UpdateCallback[]>([]);

  const undoActions = useRef<UndoAction[]>([]);
  const redoActions = useRef<UndoAction[]>([]);

  const [undoRedoId, setUndoRedoId] = useState(randomString());

  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  const [offset, setOffset] = useState(new Location());

  const [scale, setScale] = useState(ilerp(0.25, 1600, 10));

  const [mouseLoc, setMouseLoc] = useState(new Location());
  const [mouseScaledLoc, setMouseScaledLoc] = useState(new Location());
  const [freeMouseLoc, setFreeMouseLoc] = useState(new Location());

  const [layers, setLayers] = useState<Layer[]>([]);

  const [primaryColor, setPrimaryColor] = useState<Color>(
    new Color(0, 0, 0, 255)
  );
  const [secondaryColor, setSecondaryColor] = useState<Color>(
    new Color(255, 255, 255, 255)
  );
  const [lastColorChanged, setLastColorChanged] = useState<0 | 1>(0);

  const [selection, setSelection] = useState(new Selection(0, 0, 0, 0));
  const [projectionSelection, setProjectionSelection] = useState<
    ProjectionSelection | undefined
  >();
  const [selectionClickability, setSelectionClickability] =
    useState<SelectionClickability>("WORKING");

  const [activeToolId, setActiveToolId] = useState<ToolTypes>("brush");

  const [brushSize, setBrushSize] = useState(3);
  const [brushHardness, setBrushHardness] = useState(0.5);

  const [notificationData, setNotificationData] = useState<NotificationData>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stateValue: PaintContextType = {
    updateCallbacks,
    setUpdateCallbacks,
    undoActions,
    redoActions,
    undoRedoId,
    setUndoRedoId,
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
    freeMouseLoc,
    setFreeMouseLoc,
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
    projectionSelection,
    setProjectionSelection,
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

  useEffect(() => {
    if (updateCallbacks.length > 0) {
      const [firstUpdate] = updateCallbacks;
      firstUpdate(stateValue);
      setUpdateCallbacks(updateCallbacks.slice(1));
    }
  }, [updateCallbacks, stateValue]);

  return (
    <PaintContext.Provider value={stateValue}>{children}</PaintContext.Provider>
  );
};
export default PaintProvider;

export const PaintFetcher = () => {
  return useContext(PaintContext);
};
