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
import Location from "@shared/types/location";
import { clamp } from "lodash";

const PaintContainer: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDragStart, setMouseDragStart] = useState<Location>({
    x: 0,
    y: 0,
  });
  const [mouseDragContainerPosStart, setMouseDragContainerPosStart] =
    useState<Location>({
      x: 0,
      y: 0,
    });

  const {
    width,
    height,
    scale,
    offset,
    setOffset,
    setScale,
    setLayers,
    setActiveLayers,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
    mouseScaledLoc,
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
      setScale(clamp(scale + e.deltaY / -1000, 0, 100));
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

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);
    setMouseDragStart({ x: e.clientX, y: e.clientY });
    setMouseDragContainerPosStart({ ...offset });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const containerOffset = { x: 0, y: 0 };

    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      containerOffset.x = rect.x;
      containerOffset.y = rect.y;
    }

    const realScale = getRealScale();

    setMouseLoc({
      x: Math.floor((e.clientX - containerOffset.x - offset.x) / realScale),
      y: Math.floor((e.clientY - containerOffset.y - offset.y) / realScale),
    });
    setMouseScaledLoc({ x: mouseLoc.x * realScale, y: mouseLoc.y * realScale });

    if (isMouseDown) {
      if (e.buttons == 1) {
        for (const layer of layers) {
          if (!(layer.id in activeLayers)) continue;

          layer.setPixelData(mouseLoc.x, mouseLoc.y, 255, 0, 0, 255);
          layer.updatePixels();
        }
      } else if (e.buttons == 4) {
        setOffset({
          x: mouseDragContainerPosStart.x + (e.clientX - mouseDragStart.x),
          y: mouseDragContainerPosStart.y + (e.clientY - mouseDragStart.y),
        });
      }
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const styledMemo = useMemo(() => {
    const realScale = getRealScale();

    return {
      width: `${Math.floor(width * realScale)}px`,
      height: `${Math.floor(height * realScale)}px`,
    };
  }, [width, height, getRealScale]);

  const styledContainerMemo = useMemo(() => {
    return {
      left: `${offset.x}px`,
      top: `${offset.y}px`,
    };
  }, [offset]);

  const renderLayers = layers.map((layer) => {
    return <Canvas key={layer.id} layer={layer} />;
  });

  return (
    <div className={css.root} style={styledMemo} ref={containerRef}>
      <div
        className={css.layersContainer}
        style={styledContainerMemo}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {renderLayers}
        <CursorHandle />
      </div>
      <LayersContainer />
    </div>
  );
};

export default PaintContainer;
