import Layer, { ActiveLayersState } from "@shared/types/layer";
import Location from "@shared/types/location";
import { createContext, FC, ReactNode, useContext, useState } from "react";

type PaintContextType = {
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
};

const defaultValue: PaintContextType = {
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
};

export const PaintContext = createContext<PaintContextType>(defaultValue);

type Props = {
  children: ReactNode;
};

const PaintProvider: FC<Props> = ({ children }) => {
  const [scale, setScale] = useState(10);
  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [mouseScaledLoc, setMouseScaledLoc] = useState<Location>({
    x: 0,
    y: 0,
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({});

  return (
    <PaintContext.Provider
      value={{
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
