import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import {
  FC,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import css from "./selectionContainer.module.scss";
import SelectionEdge from "./selectionEdge";

const SelectionContainer: FC = () => {
  const isMouseDownRef = useRef(false);
  const mouseStartDragMousePos = useRef(new Location());
  const mouseStartDragSelectionPos = useRef(new Location());

  const { width, height, offset, getRealScale, selection, setSelection } =
    PaintFetcher();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMouseDownRef.current) {
        const offset = new Location(e.clientX, e.clientY).minus(
          mouseStartDragMousePos.current
        );
        const scale = getRealScale();
        const selectionStartPos = mouseStartDragSelectionPos.current;

        setSelection(
          selection.newLocation(
            new Location(
              clamp(
                selectionStartPos.x + Math.round(offset.x / scale),
                0,
                width - selection.width
              ),
              clamp(
                selectionStartPos.y + Math.round(offset.y / scale),
                0,
                height - selection.height
              )
            )
          )
        );
      }
    },
    [getRealScale, selection, setSelection, width, height]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target != e.currentTarget) return;
    if (e.button != 0) return;

    isMouseDownRef.current = true;
    mouseStartDragMousePos.current = new Location(e.clientX, e.clientY);
    mouseStartDragSelectionPos.current = new Location(selection.x, selection.y);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const memoStyle = useMemo(() => {
    const scale = getRealScale();

    return {
      left: `${(width / -2 + offset.x + selection.x) * scale}px`,
      top: `${(height / -2 + offset.y + selection.y) * scale}px`,
      width: `${selection.width * scale}px`,
      height: `${selection.height * scale}px`,
    };
  }, [getRealScale, width, offset, selection, height]);

  return (
    <div className={css.root} style={memoStyle} onMouseDown={handleMouseDown}>
      <SelectionEdge direction="up" />
      <SelectionEdge direction="down" />
      <SelectionEdge direction="left" />
      <SelectionEdge direction="right" />
    </div>
  );
};

export default SelectionContainer;
