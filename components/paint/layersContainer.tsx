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

  const {
    offset,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
    getRealScale,
    width,
    height,
    primaryColor,
    secondaryColor,
  } = PaintFetcher();

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);
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
      x: Math.floor(
        (e.clientX -
          containerOffset.x +
          (width * realScale) / 2 -
          offset.x * realScale) /
          realScale
      ),
      y: Math.floor(
        (e.clientY -
          containerOffset.y +
          (height * realScale) / 2 -
          offset.y * realScale) /
          realScale
      ),
    });
    setMouseScaledLoc({ x: mouseLoc.x * realScale, y: mouseLoc.y * realScale });

    if (isMouseDown) {
      if (e.buttons == 1 || e.buttons == 2) {
        for (const layer of layers) {
          if (!(layer.id in activeLayers)) continue;

          const useColor = e.buttons == 1 ? primaryColor : secondaryColor;

          layer.setPixelData(
            mouseLoc.x,
            mouseLoc.y,
            useColor.r,
            useColor.g,
            useColor.b,
            useColor.a
          );
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
      width: `${width}px`,
      height: `${height}px`,
      left: `${offset.x}px`,
      top: `${offset.y}px`,
    };
  }, [width, height, offset]);

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
