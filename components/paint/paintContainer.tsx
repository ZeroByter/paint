import { FC, MouseEvent, useEffect, useMemo, useState } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Location from "@shared/types/location";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import LayersContainer from "./layers/layersContainer";
import { PaintFetcher } from "components/contexts/paint";

const imageSize = 50;

const PaintContainer: FC = () => {
  const {
    scale,
    setLayers,
    setActiveLayers,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
  } = PaintFetcher();

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(50, 50, true));

    setLayers(newLayers);

    const newSelectedLayers: ActiveLayersState = {};
    newSelectedLayers[newLayers[0].id] = null;
    setActiveLayers(newSelectedLayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <CursorHandle />
      <LayersContainer />
    </div>
  );
};

export default PaintContainer;
