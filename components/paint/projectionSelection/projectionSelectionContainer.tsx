import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import { CSSProperties, FC, useEffect, useMemo, useRef } from "react";
import css from "./projectionSelectionContainer.module.scss";
import ProjectionSelectionNode from "./projectionSelectionNode";

const renderingScale = 10;

const ProjectionSelectionContainer: FC = () => {
  const paintState = PaintFetcher();
  const { width, height, offset, projectionSelection } = paintState;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!projectionSelection) return;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.fillStyle = "rgba(0, 0, 255, 0.1)";

    ctx.beginPath();
    ctx.moveTo(
      projectionSelection.topLeftX * renderingScale,
      projectionSelection.topLeftY * renderingScale
    );
    ctx.lineTo(
      projectionSelection.topRightX * renderingScale,
      projectionSelection.topRightY * renderingScale
    );
    ctx.lineTo(
      projectionSelection.bottomRightX * renderingScale,
      projectionSelection.bottomRightY * renderingScale
    );
    ctx.lineTo(
      projectionSelection.bottomLeftX * renderingScale,
      projectionSelection.bottomLeftY * renderingScale
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }, [projectionSelection]);

  const canvasContainerStyleMemo: CSSProperties = useMemo(
    () => ({
      transform: `scale(${getRealScale(paintState)})`,
    }),
    [paintState]
  );

  const canvasStyleMemo: CSSProperties = useMemo(
    () => ({
      width: `${width}px`,
      height: `${height}px`,
      left: `${Math.round(offset.x)}px`,
      top: `${Math.round(offset.y)}px`,
    }),
    [width, height, offset.x, offset.y]
  );

  return (
    <div className={css.root}>
      <div style={canvasContainerStyleMemo}>
        <canvas
          style={canvasStyleMemo}
          className={css.canvas}
          ref={canvasRef}
          width={width * renderingScale}
          height={height * renderingScale}
        />
      </div>
      {projectionSelection && (
        <>
          <ProjectionSelectionNode corner="topLeft" />
          <ProjectionSelectionNode corner="topRight" />
          <ProjectionSelectionNode corner="bottomLeft" />
          <ProjectionSelectionNode corner="bottomRight" />
        </>
      )}
    </div>
  );
};

export default ProjectionSelectionContainer;
