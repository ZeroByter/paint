import Layer, { ActiveLayersState } from "@shared/types/layer";
import { ChangeEvent, FC } from "react";
import css from "./layerContainer.module.scss";
import _, { set } from "lodash/fp";
import { PaintFetcher } from "components/contexts/paint";

type Props = {
  layer: Layer;
  shiftKey: boolean;
};

const LayerContainer: FC<Props> = ({ layer, shiftKey }) => {
  const { setLayers, layers, setActiveLayers } = PaintFetcher();

  const handleActiveLayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (shiftKey) {
      const index = layers.indexOf(layer);
      if (e.target.checked) {
        setLayers(set([index, "active"], true, layers));
      } else {
        setLayers(set([index, "active"], false, layers));
      }
    } else {
      setActiveLayers([layer.id]);
    }
  };

  return (
    <div className={css.root}>
      <input
        type="checkbox"
        checked={layer.active}
        onChange={handleActiveLayerChange}
      />
      {layer.name}
    </div>
  );
};

export default LayerContainer;
