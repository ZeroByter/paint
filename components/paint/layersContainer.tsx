import Tools from "@client/tools";
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
  const lastDraggedRef = useRef(new Location(-1, -1));

  const [isMouseDown, setIsMouseDown] = useState(false);

  const context = PaintFetcher();
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
    activeTool,
  } = context;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);

    if (e.button == 0 || e.button == 2) {
      activeTool.onClick(context, { button: e.button });
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

    if (lastDraggedRef.current.equals(new Location(-1, -1))) {
      lastDraggedRef.current = newMouseLoc.copy();
    }

    if (isMouseDown && (e.buttons == 1 || e.buttons == 2)) {
      activeTool.onDrag(context, {
        buttons: e.buttons,
        accurateMouseLoc: newMouseLoc,
        lastDragLocation: lastDraggedRef.current,
      });
    }

    lastDraggedRef.current = newMouseLoc.copy();
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
