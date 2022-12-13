import Location from "@shared/types/location";
import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import css from "./colorWheel.module.scss";

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

const ColorWheel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 150;
    canvas.height = 150;

    setMouseLoc({ x: canvas.width / 2, y: canvas.height / 2 });

    renderPaintWheel(canvas, ctx);
  }, []);

  const renderPaintWheel = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const dist = distance(x, y, canvas.width / 2, canvas.height / 2);
        if (dist < canvas.width / 2) {
          const direction =
            -Math.atan2(x - canvas.width / 2, y - canvas.width / 2) *
              (180 / Math.PI) +
            90;

          ctx.fillStyle = `hsl(${direction}deg ${
            (1 + dist / (canvas.width / 2)) * 100
          }% ${(1 - dist / canvas.width) * 100}%)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    let newLoc = { x: e.clientX - rect.x, y: e.clientY - rect.y };
    if (
      distance(newLoc.x, newLoc.y, canvas.width / 2, canvas.height / 2) <
      canvas.width / 2
    ) {
      setMouseLoc(newLoc);
    }
  };

  const memoCursorStyle = useMemo(() => {
    return {
      left: `${mouseLoc.x}px`,
      top: `${mouseLoc.y}px`,
    };
  }, [mouseLoc]);

  return (
    <div className={css.root}>
      <canvas ref={canvasRef} onMouseMove={handleMouseMove}></canvas>
      <div style={memoCursorStyle} className={css.cursor}></div>
    </div>
  );
};

export default ColorWheel;
