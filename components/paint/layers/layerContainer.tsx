import Layer from "@shared/types/layer";
import { FC } from "react";
import css from "./layerContainer.module.scss";

type Props = {
  layer: Layer;
};

const LayerContainer: FC<Props> = ({ layer }) => {
  return <div className={css.root}>{layer.name}</div>;
};

export default LayerContainer;
