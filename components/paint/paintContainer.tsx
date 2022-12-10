import { FC, MouseEvent, useEffect, useMemo, useState } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Location from "@shared/types/location";
import Layer from "@shared/types/layer";
import { randomString } from "@shared/utils";

const imageSize = 50;

const PaintContainer: FC = () => {
  const [scale, setScale] = useState(10);
  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [mouseScaledLoc, setMouseScaledLoc] = useState<Location>({
    x: 0,
    y: 0,
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayers, setActiveLayers] = useState<number[]>([]);

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(50, 50));

    setLayers(newLayers);
    setActiveLayers([0]);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setMouseLoc({
      x: Math.floor(e.clientX / scale),
      y: Math.floor(e.clientY / scale),
    });
    setMouseScaledLoc({ x: mouseLoc.x * scale, y: mouseLoc.y * scale });
  };

  const handleMouseClick = (e: MouseEvent<HTMLDivElement>) => {
    for (const activeLayerIndex of activeLayers) {
      const activeLayer = layers[activeLayerIndex];

      activeLayer.setPixelData(mouseLoc.x, mouseLoc.y, 255, 0, 0, 255);
      activeLayer.updatePixels();
    }
  };

  const styledMemo = useMemo(() => {
    return { height: `${imageSize * scale}px` };
  }, [scale]);

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <div
      className={css.root}
      style={styledMemo}
      onMouseDown={handleMouseClick}
      onMouseMove={handleMouseMove}
    >
      {renderLayers}
      <CursorHandle location={mouseScaledLoc} />
    </div>
  );
};

export default PaintContainer;
