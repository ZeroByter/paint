import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { FC, useEffect, useMemo, useRef } from "react";
import css from "./cursorHandle.module.scss";

/*
  const styledMemo = useMemo(() => {
    return {
      width: `${getRealScale()}px`,
      left: `${mouseScaledLoc.x}px`,
      top: `${mouseScaledLoc.y}px`,
    };
  }, [mouseScaledLoc, getRealScale]);
*/

const CursorHandle: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { width, height, mouseLoc } = PaintFetcher();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(mouseLoc.x, mouseLoc.y, 1, 1);
  }, [mouseLoc]);

  return <canvas className={css.root} ref={canvasRef} />;
};

export default CursorHandle;
