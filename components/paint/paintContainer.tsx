import { FC, MouseEvent, useEffect, useMemo, useState } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Location from "@shared/types/location";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import { randomString } from "@shared/utils";
import LayersContainer from "./layers/layersContainer";

const imageSize = 50;

const PaintContainer: FC = () => {
  const [scale, setScale] = useState(10);
  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [mouseScaledLoc, setMouseScaledLoc] = useState<Location>({
    x: 0,
    y: 0,
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({});

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(50, 50, true));

    setLayers(newLayers);

    const newSelectedLayers: ActiveLayersState = {};
    newSelectedLayers[newLayers[0].id] = null;
    setActiveLayers(newSelectedLayers);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setMouseLoc({
      x: Math.floor(e.clientX / scale),
      y: Math.floor(e.clientY / scale),
    });
    setMouseScaledLoc({ x: mouseLoc.x * scale, y: mouseLoc.y * scale });
  };

  const handleMouseClick = (e: MouseEvent<HTMLDivElement>) => {
    for (const layer of layers) {
      if (!(layer.id in activeLayers)) continue;

      layer.setPixelData(mouseLoc.x, mouseLoc.y, 255, 0, 0, 255);
      layer.updatePixels();
    }
  };

  const handleAddLayer = () => {
    setLayers([...layers, new Layer(50, 50, false)]);
  };

  const styledMemo = useMemo(() => {
    return { height: `${imageSize * scale}px` };
  }, [scale]);

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <div className={css.root} style={styledMemo}>
      <div onMouseDown={handleMouseClick} onMouseMove={handleMouseMove}>
        {renderLayers}
      </div>
      <CursorHandle location={mouseScaledLoc} />
      <LayersContainer
        layers={layers}
        activeLayers={activeLayers}
        addLayer={handleAddLayer}
        setSetActiveLayers={setActiveLayers}
      />
    </div>
  );
};

export default PaintContainer;
