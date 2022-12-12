import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Canvas from "./canvas";
import css from "./paintContainer.module.scss";
import CursorHandle from "./cursorHandle";
import Layer, { ActiveLayersState } from "@shared/types/layer";
import LayersContainer from "./layers/layersContainer";
import { PaintFetcher } from "components/contexts/paint";

const PaintContainer: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    width,
    height,
    scale,
    setScale,
    setLayers,
    setActiveLayers,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
    loadFromImage,
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
      setScale(scale + e.deltaY / 1000);
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

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const offset = { x: 0, y: 0 };

    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      offset.x = rect.x;
      offset.y = rect.y;
    }

    setMouseLoc({
      x: Math.floor((e.clientX - offset.x) / scale),
      y: Math.floor((e.clientY - offset.y) / scale),
    });
    setMouseScaledLoc({ x: mouseLoc.x * scale, y: mouseLoc.y * scale });
  };

  const handleMouseClick = (e: MouseEvent<HTMLDivElement>) => {
    for (const layer of layers) {
      if (!(layer.id in activeLayers)) continue;

      layer.setPixelData(mouseLoc.x, mouseLoc.y, 255, 0, 0, 255);
      layer.updatePixels();
    }
  };

  const styledMemo = useMemo(() => {
    return {
      width: `${Math.floor(width * scale)}px`,
      height: `${Math.floor(height * scale)}px`,
    };
  }, [width, height, scale]);

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <div className={css.root} style={styledMemo} ref={containerRef}>
      <div onMouseDown={handleMouseClick} onMouseMove={handleMouseMove}>
        {renderLayers}
      </div>
      <CursorHandle />
      <LayersContainer />
    </div>
  );
};

export default PaintContainer;
