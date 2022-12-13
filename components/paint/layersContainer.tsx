import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import {
  FC,
  MouseEvent,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useMemo,
  useState,
} from "react";
import css from "./layersContainer.module.scss";

type Props = {
  children: ReactNode;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

const LayersContainer: FC<Props> = ({ children, containerRef }) => {
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
    offset,
    setOffset,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
    getRealScale,
  } = PaintFetcher();

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
      }
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const styledContainerMemo = useMemo(() => {
    return {
      left: `${offset.x}px`,
      top: `${offset.y}px`,
    };
  }, [offset]);

  return (
    <div
      className={css.root}
      style={styledContainerMemo}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default LayersContainer;
