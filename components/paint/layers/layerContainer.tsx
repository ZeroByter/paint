import Layer, { ActiveLayersState } from "@shared/types/layer";
import { ChangeEvent, FC } from "react";
import css from "./layerContainer.module.scss";
import _ from "lodash/fp";

type Props = {
  layer: Layer;
  activeLayer: boolean;
  activeLayers: ActiveLayersState;
  setActiveLayers: (activeLayers: ActiveLayersState) => void;
  shiftKey: boolean;
};

const LayerContainer: FC<Props> = ({
  layer,
  activeLayer,
  activeLayers,
  setActiveLayers,
  shiftKey,
}) => {
  const handleActiveLayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (shiftKey) {
      if (e.target.checked) {
        const newActiveLayers = _.flow([_.clone, _.set([layer.id], null)])(
          activeLayers
        );
        setActiveLayers(newActiveLayers);
      } else {
        setActiveLayers(_.omit([layer.id], activeLayers));
      }
    } else {
      setActiveLayers({ [layer.id]: null });
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
