import Layer from "@shared/types/layer";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent, useEffect, useState } from "react";
import LayerContainer from "./layerContainer";
import css from "./layersPanel.module.scss";

const LayersPanel: FC = () => {
  const [shift, setShift] = useState(false);

  const { width, height, layers, setLayers } = PaintFetcher();

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
    const newLayers = [
      ...layers,
      new Layer(width, height, false, layers.length),
    ].sort((a, b) => a.order - b.order);

    setLayers(newLayers);
  };

  return (
    <div className={css.root}>
      <div>{renderLayers}</div>
      <div>
        <button onClick={handleAddLayerClick}>add layer</button>
      </div>
    </div>
  );
};

export default LayersPanel;
