import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import LayersPanel from "./layers/layersPanel";
import { PaintFetcher } from "components/contexts/paint";
import { clamp } from "lodash";
import RootContainer from "./rootContainer";
import LayersContainer from "./layersContainer";
import ColorsPanel from "./colors/colorsPanel";
import ToolsPanel from "./tools/toolsPanel";
import SelectionContainer from "./selection/selectionContainer";
import SelectionProvider from "components/contexts/selection";

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

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <RootContainer>
      <div className={css.root} ref={containerRef}>
        <LayersContainer containerRef={containerRef}>
          {renderLayers}
          <CursorHandle />
        </LayersContainer>
        <SelectionProvider>
          <SelectionContainer />
        </SelectionProvider>
      </div>
      <LayersPanel />
      <ColorsPanel />
      <ToolsPanel />
    </RootContainer>
  );
};

export default PaintContainer;
