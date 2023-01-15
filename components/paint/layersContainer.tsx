import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools from "@client/tools";
import { getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import {
  FC,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
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
  const paintState = context;
  const {
    offset,
    mouseLoc,
    setMouseLoc,
    setMouseScaledLoc,
    width,
    height,
    activeToolId,
  } = paintState;

  useWindowEvent(
    "mousedown",
    useCallback(
      (e: MouseEvent) => {
        if ((e.target as any).getAttribute("data-interactable") != "true")
          return;

        setIsMouseDown(true);

        lastDraggedRef.current = mouseLoc.copy();

        if (e.button == 0 || e.button == 2) {
          Tools[activeToolId].onMouseDown(context, { button: e.button });
        }
      },
      [activeToolId, context, mouseLoc]
    )
  );

  useWindowEvent(
    "mousemove",
    useCallback(
      (e: MouseEvent) => {
        const containerOffset = { x: 0, y: 0 };

        if (containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          containerOffset.x = rect.x;
          containerOffset.y = rect.y;
        }

        const realScale = getRealScale(paintState);

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
          Tools[activeToolId].onDrag(context, {
            buttons: e.buttons,
            accurateMouseLoc: newMouseLoc,
            lastDragLocation: lastDraggedRef.current,
          });
        }

        lastDraggedRef.current = newMouseLoc.copy();
      },
      [
        activeToolId,
        containerRef,
        context,
        height,
        isMouseDown,
        offset.x,
        offset.y,
        paintState,
        setMouseLoc,
        setMouseScaledLoc,
        width,
      ]
    )
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if ((e.target as any).getAttribute("data-interactable") != "true") return;

      setIsMouseDown(false);

      if (e.button == 0 || e.button == 2) {
        Tools[activeToolId].onMouseUp(context, { button: e.button });
      }
    },
    [activeToolId, context]
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  const styledRootMemo = useMemo(() => {
    return {
      transform: `scale(${getRealScale(paintState)})`,
    };
  }, [paintState]);

  const styledContainerMemo = useMemo(() => {
    return {
      width: `${width}px`,
      height: `${height}px`,
      left: `${offset.x}px`,
      top: `${offset.y}px`,
    };
  }, [width, height, offset]);

  return (
    <div style={styledRootMemo}>
      <div className={css.root} style={styledContainerMemo}>
        {children}
      </div>
    </div>
  );
};

export default LayersContainer;
