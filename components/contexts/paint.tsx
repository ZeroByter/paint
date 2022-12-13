import { ilerp, lerp } from "@client/utils";
import Color from "@shared/types/color";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import Location from "@shared/types/location";
import { xor } from "lodash";
import { createContext, FC, ReactNode, useContext, useState } from "react";

type PaintContextType = {
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
  activeLayers: ActiveLayersState;
  setActiveLayers: (newScale: ActiveLayersState) => void;

  primaryColor: Color;
  setPrimaryColor: (newColor: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (newColor: Color) => void;

  loadFromImage: (image: HTMLImageElement) => void;

  getRealScale: () => number;

  setPixelColor: (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    update: boolean
  ) => void;
};

const defaultValue: PaintContextType = {
  width: 0,
  setWidth: () => {},
  height: 0,
  setHeight: () => {},

  offset: { x: 0, y: 0 },
  setOffset: () => {},

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

  primaryColor: { r: 0, g: 0, b: 0, a: 0 },
  setPrimaryColor: () => {},
  secondaryColor: { r: 0, g: 0, b: 0, a: 0 },
  setSecondaryColor: () => {},

  loadFromImage: () => {},

  getRealScale: () => 0,

  setPixelColor: () => {},
};

export const PaintContext = createContext<PaintContextType>(defaultValue);

type Props = {
  children: ReactNode;
};

const PaintProvider: FC<Props> = ({ children }) => {
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  const [offset, setOffset] = useState<Location>({ x: 0, y: 0 });

  const [scale, setScale] = useState(ilerp(0.25, 1600, 10));

  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [mouseScaledLoc, setMouseScaledLoc] = useState<Location>({
    x: 0,
    y: 0,
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({});

  const [primaryColor, setPrimaryColor] = useState<Color>(
    new Color(0, 0, 0, 255)
  );
  const [secondaryColor, setSecondaryColor] = useState<Color>(
    new Color(255, 255, 255, 255)
  );

  const loadFromImage = (image: HTMLImageElement) => {
    setWidth(image.width);
    setHeight(image.height);

    const newLayer = new Layer(image.width, image.height, true);
    newLayer.setPixelDataFromImage(image);

    setLayers([newLayer]);
    setActiveLayers({ [newLayer.id]: null });

    setOffset({ x: 0, y: 0 });

    const a = window.innerWidth / image.width;
    const b = (window.innerHeight - 31) / image.height; //TODO: 31 is a bad hard-wired variable, need to make this actually dynamic based on canvas's available size!
    setScale(ilerp(0.25, 1600, Math.min(b, a)));
  };

  const getRealScale = () => {
    return lerp(0.25, 1600, scale);
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
    for (const layer of layers) {
      if (!(layer.id in activeLayers)) continue;

      layer.setPixelData(x, y, r, g, b, a);
      update && layer.updatePixels();
    }
  };

  return (
    <PaintContext.Provider
      value={{
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
        activeLayers,
        setActiveLayers,
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        loadFromImage,
        getRealScale,
        setPixelColor,
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
