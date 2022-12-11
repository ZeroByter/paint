import Layer, { ActiveLayersState } from "@shared/types/layer";
import { FC, MouseEvent } from "react";
import LayerContainer from "./layerContainer";
import css from "./layersContainer.module.scss";

type Props = {
  layers: Layer[];
  activeLayers: ActiveLayersState;
  addLayer: () => void;
  setSetActiveLayers: (activeLayers: ActiveLayersState) => void;
};

const LayersContainer: FC<Props> = ({
  layers,
  activeLayers,
  addLayer,
  setSetActiveLayers,
}) => {
  const renderLayers = layers.map((layer) => {
    return (
      <LayerContainer
        key={layer.id}
        layer={layer}
        activeLayer={layer.id in activeLayers}
      />
    );
  });

  const handleAddLayerClick = (e: MouseEvent<HTMLButtonElement>) => {
    addLayer();
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
