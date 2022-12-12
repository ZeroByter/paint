import Layer, { ActiveLayersState } from "@shared/types/layer";
import Location from "@shared/types/location";
import { createContext, FC, ReactNode, useContext, useState } from "react";

type PaintContextType = {
  width: number;
  setWidth: (newWidth: number) => void;
  height: number;
  setHeight: (newHeight: number) => void;

  scale: number;
  setScale: (newScale: number) => void;
  mouseLoc: Location;
  setMouseLoc: (newLoc: Location) => void;
  mouseScaledLoc: Location;
  setMouseScaledLoc: (newLoc: Location) => void;

  layers: Layer[];
  setLayers: (newScale: Layer[]) => void;
  activeLayers: ActiveLayersState;
  setActiveLayers: (newScale: ActiveLayersState) => void;

  loadFromImage: (image: HTMLImageElement) => void;
};

const defaultValue: PaintContextType = {
  width: 0,
  setWidth: () => {},
  height: 0,
  setHeight: () => {},

  scale: 1,
  setScale: () => {},
  mouseLoc: { x: 0, y: 0 },
  setMouseLoc: () => {},
  mouseScaledLoc: { x: 0, y: 0 },
  setMouseScaledLoc: () => {},

  layers: [],
  setLayers: () => {},
  activeLayers: {},
  setActiveLayers: () => {},

  loadFromImage: () => {},
};

export const PaintContext = createContext<PaintContextType>(defaultValue);

type Props = {
  children: ReactNode;
};

const PaintProvider: FC<Props> = ({ children }) => {
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  const [scale, setScale] = useState(10);
  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [mouseScaledLoc, setMouseScaledLoc] = useState<Location>({
    x: 0,
    y: 0,
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({});

  const loadFromImage = (image: HTMLImageElement) => {
    setWidth(image.width);
    setHeight(image.height);

    const newLayer = new Layer(image.width, image.height, true);
    newLayer.setPixelDataFromImage(image);

    setLayers([newLayer]);
    setActiveLayers({ [newLayer.id]: null });

    const a = window.innerWidth / image.width;
    const b = (window.innerHeight - 31) / image.height; //TODO: 31 is a bad hard-wired variable, need to make this actually dynamic based on canvas's available size!
    setScale(Math.min(b, a));
  };

  return (
    <PaintContext.Provider
      value={{
        width,
        setWidth,
        height,
        setHeight,
        scale,
        setScale,
        mouseLoc,
        setMouseLoc,
        mouseScaledLoc,
        setMouseScaledLoc,
        layers,
        setLayers,
        activeLayers,
        setActiveLayers,
        loadFromImage,
      }}
    >
      {children}
    </PaintContext.Provider>
  );
};
export default PaintProvider;

export const PaintFetcher = () => {
  return useContext(PaintContext);
};
