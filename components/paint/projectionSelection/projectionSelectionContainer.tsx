import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import { CSSProperties, FC, useEffect, useMemo, useRef } from "react";
import css from "./projectionSelectionContainer.module.scss";
import ProjectionSelectionNode from "./projectionSelectionNode";

const renderingScale = 10;

const ProjectionSelectionContainer: FC = () => {
  const paintState = PaintFetcher();
  const { projectionSelection, offset, width, height } = paintState;

  const getCornerLocation = (
    corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  ) => {
    if (!projectionSelection) {
      return "0 0";
    }

    const realScale = getRealScale(paintState);

    let cornerX = 0;
    let cornerY = 0;

    if (corner == "topLeft") {
      cornerX = projectionSelection.topLeftX;
      cornerY = projectionSelection.topLeftY;
    } else if (corner == "topRight") {
      cornerX = projectionSelection.topRightX;
      cornerY = projectionSelection.topRightY;
    } else if (corner == "bottomLeft") {
      cornerX = projectionSelection.bottomLeftX;
      cornerY = projectionSelection.bottomLeftY;
    } else {
      cornerX = projectionSelection.bottomRightX;
      cornerY = projectionSelection.bottomRightY;
    }

    return `${
      window.innerWidth / 2 - (width / 2 - cornerX - offset.x) * realScale
    } ${
      window.innerHeight / 2 -
      (height / 2 - cornerY - offset.y) * realScale +
      32
    }`;
  };

  return (
    <div className={css.root}>
      <svg className={css.svg}>
        <path
          d={`M ${getCornerLocation("topLeft")} L ${getCornerLocation(
            "topRight"
          )} L ${getCornerLocation("bottomRight")} L ${getCornerLocation(
            "bottomLeft"
          )} Z`}
          data-interactable="true"
          stroke="rgba(0,0,255,0.25)"
          fill="rgba(0,0,255,0.15)"
          strokeWidth={1}
        />
      </svg>
      {projectionSelection && (
        <div className={css.nodes}>
          <ProjectionSelectionNode corner={0} />
          <ProjectionSelectionNode corner={1} />
          <ProjectionSelectionNode corner={2} />
          <ProjectionSelectionNode corner={3} />
        </div>
      )}
    </div>
  );
};

export default ProjectionSelectionContainer;
