import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import LayersPanelContainer from "./layers/layersPanelContainer";
import { PaintFetcher } from "components/contexts/paint";
import { clamp } from "lodash";
import RootContainer from "./rootContainer";
import LayersContainer from "./layersContainer";

const PaintContainer: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    width,
    height,
    scale,
    offset,
    setScale,
    setLayers,
    setActiveLayers,
    layers,
    loadFromImage,
    getRealScale,
  } = PaintFetcher();

  useEffect(() => {
    const newLayers: Layer[] = [];

    newLayers.push(new Layer(width, height, true));

    setLayers(newLayers);

    const newSelectedLayers: ActiveLayersState = {};
    newSelectedLayers[newLayers[0].id] = null;
    setActiveLayers(newSelectedLayers);

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      setScale(clamp(scale + e.deltaY / -100000, 0, 100));
    },
    [scale, setScale]
  );

  useEffect(() => {
    document.addEventListener("wheel", handleScroll);

    return () => {
      document.removeEventListener("wheel", handleScroll);
    };
  }, [handleScroll]);

  const handlePaste = (e: ClipboardEvent) => {
    if (!e.clipboardData || e.clipboardData.files.length != 1) return; //TODO: Support multiple images? Each image to it's own layer, canvas size is of the biggest image

    for (let i = 0; i < e.clipboardData.files.length; i++) {
      const file = e.clipboardData.files[i];

      if (!file.type.startsWith("image")) continue;

      const image = new Image();
      image.onload = () => {
        loadFromImage(image);
      };
      image.src = window.URL.createObjectURL(file);
    }
  };

  const styledMemo = useMemo(() => {
    const realScale = getRealScale();

    return {
      width: `${Math.floor(width * realScale)}px`,
      height: `${Math.floor(height * realScale)}px`,
    };
  }, [width, height, getRealScale]);

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <RootContainer>
      <div className={css.root} style={styledMemo} ref={containerRef}>
        <LayersContainer containerRef={containerRef}>
          {renderLayers}
          <CursorHandle />
        </LayersContainer>
        <LayersPanelContainer />
      </div>
    </RootContainer>
  );
};

export default PaintContainer;
