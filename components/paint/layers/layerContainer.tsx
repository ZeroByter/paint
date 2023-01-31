import Layer, { ActiveLayersState } from "@shared/types/layer";
import { ChangeEvent, FC } from "react";
import css from "./layerContainer.module.scss";
import _, { set } from "lodash/fp";
import { PaintFetcher } from "components/contexts/paint";
import { setActiveLayers } from "components/contexts/paintUtils";

type Props = {
  layer: Layer;
  shiftKey: boolean;
};

const LayerContainer: FC<Props> = ({ layer, shiftKey }) => {
  const paintState = PaintFetcher();
  const { setLayers, layers } = paintState;

  const handleActiveLayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (shiftKey) {
      const index = layers.indexOf(layer);
      if (e.target.checked) {
        setLayers(set([index, "active"], true, layers));
      } else {
        setLayers(set([index, "active"], false, layers));
      }
    } else {
      setActiveLayers(paintState, [layer.id]);
    }
  };

  return (
    <div className={css.root}>
      <input
        type="checkbox"
        checked={layer.active}
        onChange={handleActiveLayerChange}
      />
      {layer.name} ({layer.id})
    </div>
  );
};

export default LayerContainer;
