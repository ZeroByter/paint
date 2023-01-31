import Layer from "@shared/types/layer";
import { PaintFetcher } from "components/contexts/paint";
import {
  createNewLayer,
  setActiveLayers,
} from "components/contexts/paintUtils";
import { FC, MouseEvent, useEffect, useState } from "react";
import LayerContainer from "./layerContainer";
import css from "./layersPanel.module.scss";

const LayersPanel: FC = () => {
  const [shift, setShift] = useState(false);

  const paintState = PaintFetcher();
  const { width, height, layers, setLayers } = paintState;

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    setShift(e.shiftKey);
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    setShift(false);
  };

  const renderLayers = layers.map((layer) => {
    return <LayerContainer key={layer.id} layer={layer} shiftKey={shift} />;
  });

  const handleAddLayerClick = (e: MouseEvent<HTMLButtonElement>) => {
    const newLayer = createNewLayer(paintState);
    setActiveLayers(paintState, [newLayer.id], [...layers, newLayer]);
  };

  return (
    <div className={css.root}>
      <div className={css.layers}>{renderLayers}</div>
      <div>
        <button onClick={handleAddLayerClick}>add layer</button>
      </div>
    </div>
  );
};

export default LayersPanel;
