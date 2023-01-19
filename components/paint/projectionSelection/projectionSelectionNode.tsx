import useWindowEvent from "@client/hooks/useWindowEvent";
import { clamp, getDistance, ilerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  MouseEvent as ReactMouseEvent,
  CSSProperties,
} from "react";
import css from "./projectionSelectionNode.module.scss";

type Props = {
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
};

const ProjectionSelectionNode: FC<Props> = ({ corner }) => {
  const [nodeDistance, setNodeDistance] = useState(99);

  const paintState = PaintFetcher();
  const {
    width,
    height,
    offset,
    projectionSelection,
    mouseScaledLoc,
    mouseLoc,
  } = paintState;

  const _setNodeDistance = useCallback((newDistance: number) => {
    setNodeDistance(newDistance);
  }, []);

  const getPosition = useCallback(() => {
    if (!projectionSelection) return new Location();

    const realScale = getRealScale(paintState);

    if (corner == "topLeft") {
      return new Location(
        (projectionSelection.topLeftX - width / 2 + offset.x) * realScale,
        (projectionSelection.topLeftY - height / 2 + offset.y) * realScale
      );
    } else if (corner == "topRight") {
      return new Location(
        (projectionSelection.topRightX - width / 2 + offset.x) * realScale,
        (projectionSelection.topRightY - height / 2 + offset.y) * realScale
      );
    } else if (corner == "bottomLeft") {
      return new Location(
        (projectionSelection.bottomLeftX - width / 2 + offset.x) * realScale,
        (projectionSelection.bottomLeftY - height / 2 + offset.y) * realScale
      );
    } else {
      return new Location(
        (projectionSelection.bottomRightX - width / 2 + offset.x) * realScale,
        (projectionSelection.bottomRightY - height / 2 + offset.y) * realScale
      );
    }
  }, [
    corner,
    height,
    offset.x,
    offset.y,
    paintState,
    projectionSelection,
    width,
  ]);

  useWindowEvent(
    "mousemove",
    useCallback(
      (e: MouseEvent) => {
        const scale = getRealScale(paintState);

        if (!projectionSelection) return;

        const pos = getPosition();

        _setNodeDistance(
          getDistance(
            (mouseLoc.x - width / 2 + offset.x) * scale,
            (mouseLoc.y - height / 2 + offset.y) * scale,
            pos.x,
            pos.y
          )
        );
      },
      [
        paintState,
        projectionSelection,
        getPosition,
        _setNodeDistance,
        mouseLoc.x,
        mouseLoc.y,
        width,
        offset.x,
        offset.y,
        height,
      ]
    )
  );

  const memoStyle: CSSProperties = useMemo(() => {
    const pos = getPosition();

    return {
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      opacity: `${clamp(ilerp(15, 0, nodeDistance), 0.1, 1)}`,
    };
  }, [getPosition, nodeDistance]);

  return <div className={css.root} style={memoStyle}></div>;
};

export default ProjectionSelectionNode;
