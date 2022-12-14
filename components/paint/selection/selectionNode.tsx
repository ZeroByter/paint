import { clamp, getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import SelectionProvider, {
  SelectionFetcher,
} from "components/contexts/selection";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import css from "./selectionNode.module.scss";

type Props = {
  direction: "up" | "down" | "left" | "right";
};

const SelectionNode: FC<Props> = ({ direction }) => {
  const [pos, setPos] = useState(new Location());
  const [nodeDistance, setNodeDistance] = useState(99);

  const { x, y, w, h } = SelectionFetcher();
  const { getRealScale, width, height, offset } = PaintFetcher();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const scale = getRealScale();

      if (direction == "up" || direction == "down") {
        //calculating offsets of node from left and top of whole screen
        const windowHorSpace = window.innerWidth / 2 - (width * scale) / 2;
        const windowVerSpace =
          window.innerHeight / 2 -
          (height * scale) / 2 +
          31 / 2 +
          (direction == "down" ? h * scale : 0);

        //take position of node and offset it by physical position inside window space
        const nodePosition = new Location(
          clamp(
            e.pageX - (x + offset.x) * scale - windowHorSpace,
            0,
            w * scale
          ),
          0
        );

        setNodeDistance(
          getDistance(
            e.pageX,
            e.pageY,
            nodePosition.x + (x + offset.x) * scale + windowHorSpace,
            nodePosition.y + (y + offset.y) * scale + windowVerSpace
          )
        );

        setPos(nodePosition);
      } else {
        //calculating offsets of node from left and top of whole screen
        const windowHorSpace =
          window.innerWidth / 2 -
          (width * scale) / 2 +
          (direction == "right" ? w * scale : 0);
        const windowVerSpace =
          window.innerHeight / 2 - (height * scale) / 2 + 31 / 2;

        //take position of node and offset it by physical position inside window space
        const nodePosition = new Location(
          0,
          clamp(e.pageY - (y + offset.y) * scale - windowVerSpace, 0, h * scale)
        );

        setNodeDistance(
          getDistance(
            e.pageX,
            e.pageY,
            nodePosition.x + (x + offset.x) * scale + windowHorSpace,
            nodePosition.y + (y + offset.y) * scale + windowVerSpace
          )
        );

        setPos(nodePosition);
      }
    },
    [direction, getRealScale, height, offset.x, offset.y, w, h, width, x, y]
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
      opacity: `${ilerp(10, 0, nodeDistance)}`,
    }),
    [pos, nodeDistance]
  );

  return <div className={css.root} style={memoStyle}></div>;
};

export default SelectionNode;