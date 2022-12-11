import Layer from "@shared/types/layer";
import { FC } from "react";
import css from "./layerContainer.module.scss";

type Props = {
  layer: Layer;
  activeLayer: boolean;
};

const LayerContainer: FC<Props> = ({ layer, activeLayer }) => {
  return (
    <div className={css.root} data-active={activeLayer}>
      {layer.name}
    </div>
  );
};

export default LayerContainer;
