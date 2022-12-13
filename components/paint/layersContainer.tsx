import { ilerp, lerp } from "@client/utils";
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
    lastMouseLoc,
    setLastMouseLoc,
    mouseLoc,
    setMouseLoc,
    setMouseScaledLoc,
    getRealScale,
    width,
    height,
    primaryColor,
    secondaryColor,
    setPixelColor,
  } = PaintFetcher();

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);

    if (e.button == 0 || e.button == 2) {
      const useColor = e.button == 0 ? primaryColor : secondaryColor;

      setPixelColor(
        mouseLoc.x,
        mouseLoc.y,
        useColor.r,
        useColor.g,
        useColor.b,
        useColor.a,
        true
      );
    }
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

    setLastMouseLoc({ ...mouseLoc });

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

    if (isMouseDown && (e.buttons == 1 || e.buttons == 2)) {
      const useColor = e.buttons == 1 ? primaryColor : secondaryColor;

      const minX = Math.min(mouseLoc.x, lastMouseLoc.x);
      const minY = Math.min(mouseLoc.y, lastMouseLoc.y);
      const maxX = Math.max(mouseLoc.x, lastMouseLoc.x);
      const maxY = Math.max(mouseLoc.y, lastMouseLoc.y);

      if (
        (mouseLoc.x == lastMouseLoc.x && mouseLoc.y == lastMouseLoc.y) ||
        true
      ) {
        setPixelColor(
          mouseLoc.x,
          mouseLoc.y,
          useColor.r,
          useColor.g,
          useColor.b,
          useColor.a,
          true
        );
      } else {
        for (let y = minY; y < maxY; y++) {
          for (let x = minX; x < maxX; x++) {
            const roundedX = minX + Math.round(ilerp(minX, maxX, x));
            const roundedY = minY + Math.round(ilerp(minY, maxY, y));

            setPixelColor(
              roundedX,
              roundedY,
              useColor.r,
              useColor.g,
              useColor.b,
              useColor.a,
              false
            );
          }
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
