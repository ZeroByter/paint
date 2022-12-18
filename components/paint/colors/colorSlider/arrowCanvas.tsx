import { ilerp } from "@client/utils";
import { FC, useEffect, useMemo, useRef } from "react";
import css from "./arrowCanvas.module.scss";

type Props = {
  value: number;
};

const ArrowCanvas: FC<Props> = ({ value }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 10;
    const padding = size / 10;
    canvas.width = size;
    canvas.height = size;
    const half = canvas.width / 2;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distanceToCenter = Math.abs(x - half) - y / 2;

        if (distanceToCenter <= 0) {
          ctx.fillStyle = "black";
          ctx.fillRect(x, y, 1, 1);
        }

        let whiteAlpha = ilerp(
          0,
          padding,
          padding - Math.abs(distanceToCenter)
        );
        if (y >= size - padding) whiteAlpha = 1;
        ctx.fillStyle = `rgba(255,255,255,${whiteAlpha})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  const styleMemo = useMemo(
    () => ({
      left: `${value}%`,
    }),
    [value]
  );

  return <canvas style={styleMemo} className={css.root} ref={canvasRef} />;
};

export default ArrowCanvas;
