import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools from "@client/tools";
import { clamp, getDistance, ilerp } from "@client/utils";
import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import {
  FC,
  useCallback,
  useMemo,
  useState,
  MouseEvent as ReactMouseEvent,
  CSSProperties,
  useRef,
} from "react";
import { projectImage } from "./projectionSelectionMagic";
import css from "./projectionSelectionNode.module.scss";

type Props = {
  corner: 0 | 1 | 2 | 3;
};

const ProjectionSelectionNode: FC<Props> = ({ corner }) => {
  const [nodeDistance, setNodeDistance] = useState(99);
  const isMouseDownRef = useRef(false);

  const paintState = PaintFetcher();
  const {
    width,
    height,
    offset,
    projectionSelection,
    setProjectionSelection,
    mouseLoc,
    freeMouseLoc,
    layers,
  } = paintState;

  const _setNodeDistance = useCallback((newDistance: number) => {
    setNodeDistance(newDistance);
  }, []);

  const getPosition = useCallback(() => {
    if (!projectionSelection) return new Location();

    const realScale = getRealScale(paintState);

    if (corner == 0) {
      return new Location(
        (projectionSelection.topLeftX - width / 2 + offset.x) * realScale,
        (projectionSelection.topLeftY - height / 2 + offset.y) * realScale
      );
    } else if (corner == 1) {
      return new Location(
        (projectionSelection.topRightX - width / 2 + offset.x) * realScale,
        (projectionSelection.topRightY - height / 2 + offset.y) * realScale
      );
    } else if (corner == 2) {
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
            (freeMouseLoc.x - width / 2 + offset.x) * scale,
            (freeMouseLoc.y - height / 2 + offset.y) * scale,
            pos.x,
            pos.y
          )
        );

        if (isMouseDownRef.current) {
          const newSelection = projectionSelection.newCornerLocation(
            corner,
            clamp(mouseLoc.x, 0, width),
            clamp(mouseLoc.y, 0, height)
          );

          setProjectionSelection(newSelection);

          if (!Tools["projectionSelect"].isInverse) {
            const affectedPixels = projectImage(
              layers,
              newSelection,
              Tools["projectionSelect"].initialSelection
            );
            if (affectedPixels) {
              Tools["projectionSelect"].affectedPixels = affectedPixels;
            }
          }
        }
      },
      [
        paintState,
        projectionSelection,
        getPosition,
        _setNodeDistance,
        freeMouseLoc.x,
        freeMouseLoc.y,
        width,
        offset.x,
        offset.y,
        height,
        corner,
        mouseLoc.x,
        mouseLoc.y,
        setProjectionSelection,
        layers,
      ]
    )
  );

  useWindowEvent(
    "mouseup",
    useCallback(() => {
      isMouseDownRef.current = false;
    }, [])
  );

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };

  const memoStyle: CSSProperties = useMemo(() => {
    const pos = getPosition();

    return {
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      opacity: `${clamp(ilerp(15, 0, nodeDistance), 0.3, 1)}`,
    };
  }, [getPosition, nodeDistance]);

  return (
    <div
      className={css.root}
      style={memoStyle}
      onMouseDown={handleMouseDown}
    ></div>
  );
};

export default ProjectionSelectionNode;
