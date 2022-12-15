import { clamp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { set } from "lodash/fp";
import {
  FC,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import css from "./selectionContainer.module.scss";
import SelectionEdge from "./selectionEdge";

const cursorHoverMap: { [index: number]: string } = {
  0: "move",
  1: "n-resize",
  2: "n-resize",
  4: "e-resize",
  5: "nw-resize",
  6: "ne-resize",
  8: "e-resize",
  9: "ne-resize",
  10: "nw-resize",
};

const SelectionContainer: FC = () => {
  const isMouseDownRef = useRef(false);
  const mouseStartDragMousePos = useRef(new Location());
  const mouseStartDragSelectionPos = useRef(new Location());

  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);
  const [upHover, setUpHover] = useState(false);
  const [downHover, setDownHover] = useState(false);

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

  const handleNodeHover = (index: number, isHover: boolean) => {
    switch (index) {
      case 1:
        setUpHover(isHover);
        break;
      case 2:
        setDownHover(isHover);
        break;
      case 3:
        setLeftHover(isHover);
        break;
      case 4:
        setRightHover(isHover);
        break;
    }
  };

  const memoStyle = useMemo(() => {
    const scale = getRealScale();

    let cursorIndex = 0;
    if (upHover) cursorIndex |= 1;
    if (downHover) cursorIndex |= 2;
    if (leftHover) cursorIndex |= 4;
    if (rightHover) cursorIndex |= 8;

    return {
      left: `${(width / -2 + offset.x + selection.x) * scale}px`,
      top: `${(height / -2 + offset.y + selection.y) * scale}px`,
      width: `${selection.width * scale}px`,
      height: `${selection.height * scale}px`,
      cursor: cursorHoverMap[cursorIndex],
    };
  }, [
    getRealScale,
    width,
    offset,
    selection,
    height,
    upHover,
    downHover,
    leftHover,
    rightHover,
  ]);

  return (
    <div className={css.root} style={memoStyle} onMouseDown={handleMouseDown}>
      <SelectionEdge direction="up" index={1} isHover={handleNodeHover} />
      <SelectionEdge direction="down" index={2} isHover={handleNodeHover} />
      <SelectionEdge direction="left" index={3} isHover={handleNodeHover} />
      <SelectionEdge direction="right" index={4} isHover={handleNodeHover} />
    </div>
  );
};

export default SelectionContainer;
