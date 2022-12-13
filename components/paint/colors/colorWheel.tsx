import { ilerp } from "@client/utils";
import { hslToRgb } from "@client/colorUtils";
import Location from "@shared/types/location";
import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import css from "./colorWheel.module.scss";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

const ColorWheel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mouseLoc, setMouseLoc] = useState<Location>({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const { setPrimaryColor, setSecondaryColor } = PaintFetcher();

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

  const xyToColor = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { deg: 0, sat: 0, lig: 0 };

    const dist = distance(x, y, canvas.width / 2, canvas.height / 2);
    const direction =
      -Math.atan2(x - canvas.width / 2, y - canvas.width / 2) *
        (180 / Math.PI) +
      90;

    return {
      deg: direction,
      sat: Math.round((1 + dist / (canvas.width / 2)) * 100),
      lig: Math.round((1 - dist / canvas.width) * 100),
    };
  };

  const renderPaintWheel = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const halfSize = canvas.width / 2;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const dist = distance(x, y, halfSize, halfSize);
        const color = xyToColor(x, y);

        ctx.fillStyle = `hsla(${color.deg}deg ${color.sat}% ${
          color.lig
        }% / ${ilerp(halfSize, halfSize - 1, dist)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const setMouseDownFalse = () => {
    setIsMouseDown(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const halfSize = canvas.width / 2;

      setMouseLoc({ x: halfSize, y: halfSize });
    }
  };

  const handlePickColor = (x: number, y: number, primary: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let newLoc = { x: x - rect.x, y: y - rect.y };
    if (
      distance(newLoc.x, newLoc.y, canvas.width / 2, canvas.height / 2) <
      canvas.width / 2
    ) {
      setMouseLoc(newLoc);

      const hsl = xyToColor(newLoc.x, newLoc.y);
      const rgb = hslToRgb(hsl.deg / 360, hsl.sat / 100, hsl.lig / 100);

      if (primary) {
        setPrimaryColor(new Color(rgb[0], rgb[1], rgb[2], 255));
      } else {
        setSecondaryColor(new Color(rgb[0], rgb[1], rgb[2], 255));
      }
    } else {
      setMouseDownFalse();
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      handlePickColor(e.clientX, e.clientY, e.buttons == 1);
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);

    handlePickColor(e.clientX, e.clientY, e.button == 0);
  };

  const handleMouseUp = () => {
    setMouseDownFalse();
  };

  const handleMouseLeave = () => {
    setMouseDownFalse();
  };

  const handleContextMenu = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const memoCursorStyle = useMemo(() => {
    return {
      left: `${mouseLoc.x}px`,
      top: `${mouseLoc.y}px`,
    };
  }, [mouseLoc]);

  return (
    <div className={css.root}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      ></canvas>
      <div style={memoCursorStyle} className={css.cursor}></div>
    </div>
  );
};

export default ColorWheel;
