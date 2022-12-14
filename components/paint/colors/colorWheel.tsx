import { getDistance, ilerp } from "@client/utils";
import { hslToRgb } from "@client/colorUtils";
import Location from "@shared/types/location";
import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import css from "./colorWheel.module.scss";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";

const ColorWheel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mouseLoc, setMouseLoc] = useState<Location>(new Location());
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const { setPrimaryColor, setSecondaryColor } = PaintFetcher();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 150;
    canvas.height = 150;

    setMouseLoc(new Location(canvas.width / 2, canvas.height / 2));

    renderPaintWheel(canvas, ctx);
  }, []);

  const xyToColor = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { deg: 0, sat: 0, lig: 0 };

    const dist = getDistance(x, y, canvas.width / 2, canvas.height / 2);
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
        const dist = getDistance(x, y, halfSize, halfSize);
        const color = xyToColor(x, y);

        ctx.fillStyle = `hsla(${color.deg}deg ${color.sat}% ${
          color.lig
        }% / ${ilerp(halfSize, halfSize - 1, dist)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const handlePickColor = (x: number, y: number, primary: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let newLoc = new Location(x - rect.x, y - rect.y);
    if (
      getDistance(newLoc.x, newLoc.y, canvas.width / 2, canvas.height / 2) <
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
      setIsMouseDown(false);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      handlePickColor(e.clientX, e.clientY, e.buttons == 1);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setIsMouseOver(
        getDistance(
          e.clientX - rect.x,
          e.clientY - rect.y,
          canvas.width / 2,
          canvas.height / 2
        ) <
          canvas.width / 2
      );
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);

    handlePickColor(e.clientX, e.clientY, e.button == 0);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsMouseOver(false);
  };

  const handleContextMenu = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const memoCanvasStyle = useMemo(
    () => ({
      cursor: isMouseOver ? "pointer" : "initial",
    }),
    [isMouseOver]
  );

  const memoCursorStyle = useMemo(
    () => ({
      left: `${mouseLoc.x}px`,
      top: `${mouseLoc.y}px`,
    }),
    [mouseLoc]
  );

  return (
    <div className={css.root}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        style={memoCanvasStyle}
      ></canvas>
      <div style={memoCursorStyle} className={css.cursor}></div>
    </div>
  );
};

export default ColorWheel;
