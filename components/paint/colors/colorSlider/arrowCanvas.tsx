import { FC, useEffect, useRef } from "react";
import css from "./arrowCanvas.module.scss";

const ArrowCanvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 20;
    const padding = size / 20;
    canvas.width = size;
    canvas.height = size;
    const half = canvas.width / 2;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distanceToCenter = Math.abs(x - half) - y / 2;

        if (
          y >= canvas.height - 1 - padding ||
          (distanceToCenter >= 0 && distanceToCenter <= padding)
        ) {
          ctx.fillStyle = "white";
          ctx.fillRect(x, y, 1, 1);
        } else if (distanceToCenter < 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, []);

  return <canvas className={css.root} ref={canvasRef} />;
};

export default ArrowCanvas;
