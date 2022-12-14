import { getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import {
  FC,
  MouseEvent,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import css from "./layersContainer.module.scss";

type Props = {
  children: ReactNode;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

const LayersContainer: FC<Props> = ({ children, containerRef }) => {
  const lastPaintedLocRef = useRef(new Location(-1, -1));

  const [isMouseDown, setIsMouseDown] = useState(false);

  const {
    offset,
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

    const newMouseLoc = new Location(
      Math.floor(
        (e.clientX -
          containerOffset.x +
          (width * realScale) / 2 -
          offset.x * realScale) /
          realScale
      ),
      Math.floor(
        (e.clientY -
          containerOffset.y +
          (height * realScale) / 2 -
          offset.y * realScale) /
          realScale
      )
    );

    setMouseLoc(newMouseLoc);
    setMouseScaledLoc(
      new Location(newMouseLoc.x * realScale, newMouseLoc.y * realScale)
    );

    if (lastPaintedLocRef.current.equals(new Location(-1, -1))) {
      lastPaintedLocRef.current = newMouseLoc.copy();
    }

    if (isMouseDown && (e.buttons == 1 || e.buttons == 2)) {
      const useColor = e.buttons == 1 ? primaryColor : secondaryColor;

      const lastMouseLoc = lastPaintedLocRef.current.copy();

      const distance = Math.ceil(
        getDistance(
          newMouseLoc.x,
          newMouseLoc.y,
          lastMouseLoc.x,
          lastMouseLoc.y
        )
      );
      const direction = lastMouseLoc.minus(newMouseLoc).normalized();

      for (let i = 0; i < distance; i++) {
        const paintLocation = newMouseLoc.add(
          direction.add(direction.multiply(i))
        );

        setPixelColor(
          Math.round(paintLocation.x),
          Math.round(paintLocation.y),
          useColor.r,
          useColor.g,
          useColor.b,
          useColor.a,
          true
        );
      }
    }

    lastPaintedLocRef.current = newMouseLoc.copy();
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
