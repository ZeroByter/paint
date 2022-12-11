import Layer, { ActiveLayersState } from "@shared/types/layer";
import { ChangeEvent, FC } from "react";
import css from "./layerContainer.module.scss";
import _ from "lodash/fp";

type Props = {
  layer: Layer;
  activeLayer: boolean;
  activeLayers: ActiveLayersState;
  setActiveLayers: (activeLayers: ActiveLayersState) => void;
};

const LayerContainer: FC<Props> = ({
  layer,
  activeLayer,
  activeLayers,
  setActiveLayers,
}) => {
  const handleActiveLayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newActiveLayers = _.flow([_.clone, _.set([layer.id], null)])(
        activeLayers
      );
      setActiveLayers(newActiveLayers);
    } else {
      setActiveLayers(_.omit([layer.id], activeLayers));
    }
  };

  return (
    <div className={css.root}>
      <input
        type="checkbox"
        checked={activeLayer}
        onChange={handleActiveLayerChange}
      />
      {layer.name}
    </div>
  );
};

export default LayerContainer;
