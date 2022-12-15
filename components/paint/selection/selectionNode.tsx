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
};

const SelectionNode: FC<Props> = ({ direction }) => {
  const isMouseDownRef = useRef(false);
  const mouseStartDragMousePos = useRef(new Location());
  const mouseStartDragSelection = useRef(new Selection());

  const [pos, setPos] = useState(new Location());
  const [nodeDistance, setNodeDistance] = useState(99);

  const { getRealScale, width, height, offset, selection } = PaintFetcher();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const scale = getRealScale();

      if (isMouseDownRef.current) {
        if (direction == "right") {
          console.log("meme");
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

        setNodeDistance(
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

        setNodeDistance(
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
    [direction, getRealScale, height, offset, selection, width, isMouseDownRef]
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
    console.log("down");

    isMouseDownRef.current = true;
    mouseStartDragMousePos.current = new Location(e.clientX, e.clientY);
    mouseStartDragSelection.current = selection.copy();
  };

  const handleMouseUp = () => {
    console.log("up");
    isMouseDownRef.current = false;
  };

  const memoStyle = useMemo(
    () => ({
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      opacity: `${ilerp(10, 0, nodeDistance)}`,
    }),
    [pos, nodeDistance]
  );

  return (
    <div className={css.root} style={memoStyle} onClick={handleMouseDown}></div>
  );
};

export default SelectionNode;
