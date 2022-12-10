import Layer from "@shared/types/layer";
import { FC } from "react";
import LayerContainer from "./layerContainer";
import css from "./layersContainer.module.scss";

type Props = {
  layers: Layer[];
};

const LayersContainer: FC<Props> = ({ layers }) => {
  const renderLayers = layers.map((layer) => {
    return <LayerContainer key={layer.id} layer={layer} />;
  });

  return <div className={css.root}>{renderLayers}</div>;
};

export default LayersContainer;
