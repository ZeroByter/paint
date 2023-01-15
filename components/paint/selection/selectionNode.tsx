import { clamp, getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
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
  const [pos, setPos] = useState(new Location());
  const [nodeDistance, setNodeDistance] = useState(99);

  const paintState = PaintFetcher();
  const { width, height, offset, selection } = paintState;

  const _setNodeDistance = useCallback(
    (newDistance: number) => {
      isHover(newDistance < 5);

      setNodeDistance(newDistance);
    },
    [isHover]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const scale = getRealScale(paintState);

      if (direction == "up" || direction == "down") {
        //calculating offsets of node from left and top of whole screen
        const windowHorSpace = window.innerWidth / 2 - (width * scale) / 2;
        const windowVerSpace =
          window.innerHeight / 2 -
          (height * scale) / 2 +
          65 / 2 +
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
          window.innerHeight / 2 - (height * scale) / 2 + 65 / 2;

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
    [
      getRealScale,
      direction,
      selection,
      width,
      height,
      offset,
      _setNodeDistance,
    ]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const memoStyle = useMemo(
    () => ({
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      opacity: `${clamp(ilerp(10, 0, nodeDistance), 0.1, 1)}`,
    }),
    [pos, nodeDistance]
  );

  return <div className={css.root} style={memoStyle}></div>;
};

export default SelectionNode;
