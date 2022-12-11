import Layer, { ActiveLayersState } from "@shared/types/layer";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent } from "react";
import LayerContainer from "./layerContainer";
import css from "./layersContainer.module.scss";

const LayersContainer: FC = () => {
  const { width, height, layers, setLayers, activeLayers, setActiveLayers } =
    PaintFetcher();

  const renderLayers = layers.map((layer) => {
    return (
      <LayerContainer
        key={layer.id}
        layer={layer}
        activeLayer={layer.id in activeLayers}
        activeLayers={activeLayers}
        setActiveLayers={setActiveLayers}
      />
    );
  });

  const handleAddLayerClick = (e: MouseEvent<HTMLButtonElement>) => {
    setLayers([...layers, new Layer(width, height, false)]);
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

export default LayersContainer;
