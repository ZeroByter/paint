import { clamp, getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintFetcher } from "components/contexts/paint";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";
import css from "./selectionNode.module.scss";

type Props = {
  direction: "up" | "down" | "left" | "right";
  isHover: (hover: boolean) => void;
};

const SelectionNode: FC<Props> = ({ direction, isHover }) => {
  const isMouseDownRef = useRef(false);
  const mouseStartDragMousePos = useRef(new Location());
  const mouseStartDragSelection = useRef(new Selection());

  const [pos, setPos] = useState(new Location());
  const [nodeDistance, setNodeDistance] = useState(99);

  const { getRealScale, width, height, offset, selection, setSelection } =
    PaintFetcher();

  const _setNodeDistance = (newDistance: number) => {
    isHover(newDistance < 5);

    setNodeDistance(newDistance);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const scale = getRealScale();

      if (isMouseDownRef.current) {
        const scale = getRealScale();
        const offset = new Location(e.clientX, e.clientY)
          .minus(mouseStartDragMousePos.current)
          .divide(scale);
        const selectionStart = mouseStartDragSelection.current;

        if (direction == "left") {
          setSelection(
            new Selection(
              selectionStart.x +
                clamp(
                  Math.round(offset.x),
                  -selectionStart.x,
                  selectionStart.width
                ),
              selection.y,
              clamp(
                selectionStart.width - Math.round(offset.x),
                0,
                selectionStart.width + selectionStart.x
              ),
              selection.height
            )
          );
        } else if (direction == "right") {
          setSelection(
            new Selection(
              selection.x,
              selection.y,
              clamp(
                selectionStart.width + Math.round(offset.x),
                0,
                width - selection.x
              ),
              selection.height
            )
          );
        } else if (direction == "up") {
          setSelection(
            new Selection(
              selection.x,
              selectionStart.y +
                clamp(
                  Math.round(offset.y),
                  -selectionStart.y,
                  selectionStart.height
                ),
              selection.width,
              clamp(
                selectionStart.height - Math.round(offset.y),
                0,
                selectionStart.height + selectionStart.y
              )
            )
          );
        } else if (direction == "down") {
          setSelection(
            new Selection(
              selection.x,
              selection.y,
              selection.width,
              clamp(
                selectionStart.height + Math.round(offset.y),
                0,
                height - selection.y
              )
            )
          );
        }
      }

      if (direction == "up" || direction == "down") {
        //calculating offsets of node from left and top of whole screen
        const windowHorSpace = window.innerWidth / 2 - (width * scale) / 2;
        const windowVerSpace =
          window.innerHeight / 2 -
          (height * scale) / 2 +
          31 / 2 +
          (direction == "down" ? selection.height * scale : 0);

        //take position of node and offset it by physical position inside window space
        const nodePosition = new Location(
          clamp(
            e.pageX - (selection.x + offset.x) * scale - windowHorSpace,
            0,
            selection.width * scale
          ),
          0
        );

        _setNodeDistance(
          getDistance(
            e.pageX,
            e.pageY,
            nodePosition.x + (selection.x + offset.x) * scale + windowHorSpace,
            nodePosition.y + (selection.y + offset.y) * scale + windowVerSpace
          )
        );

        setPos(nodePosition);
      } else {
        //calculating offsets of node from left and top of whole screen
        const windowHorSpace =
          window.innerWidth / 2 -
          (width * scale) / 2 +
          (direction == "right" ? selection.width * scale : 0);
        const windowVerSpace =
          window.innerHeight / 2 - (height * scale) / 2 + 31 / 2;

        //take position of node and offset it by physical position inside window space
        const nodePosition = new Location(
          0,
          clamp(
            e.pageY - (selection.y + offset.y) * scale - windowVerSpace,
            0,
            selection.height * scale
          )
        );

        _setNodeDistance(
          getDistance(
            e.pageX,
            e.pageY,
            nodePosition.x + (selection.x + offset.x) * scale + windowHorSpace,
            nodePosition.y + (selection.y + offset.y) * scale + windowVerSpace
          )
        );

        setPos(nodePosition);
      }
    },
    [getRealScale, direction, setSelection, selection, width, height, offset]
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
    if (e.button != 0) return;

    isMouseDownRef.current = true;
    mouseStartDragMousePos.current = new Location(e.clientX, e.clientY);
    mouseStartDragSelection.current = selection.copy();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const memoStyle = useMemo(
    () => ({
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      opacity: `${clamp(ilerp(10, 0, nodeDistance), 0.1, 1)}`,
    }),
    [pos, nodeDistance]
  );

  return (
    <div
      className={css.root}
      style={memoStyle}
      onMouseDown={handleMouseDown}
    ></div>
  );
};

export default SelectionNode;
