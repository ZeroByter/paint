import { getDistance, ilerp } from "@client/utils";
import Location from "@shared/types/location";
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import css from "./colorWheel.module.scss";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";
import colorsys from "colorsys";
import useWindowEvent from "@client/hooks/useWindowEvent";

const ColorWheel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mouseLoc, setMouseLoc] = useState<Location>(new Location());
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const {
    setPrimaryColor,
    setSecondaryColor,
    setLastColorChanged,
    lastColorChanged,
    primaryColor,
    secondaryColor,
  } = PaintFetcher();

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
      deg: (direction + 360) % 360,
      sat: 100,
      lig: Math.round((1 - dist / canvas.width) * 100),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lastColor = lastColorChanged == 0 ? primaryColor : secondaryColor;
    const hsv = colorsys.rgbToHsv(lastColor);

    setMouseLoc(
      Location.fromAngle(-hsv.h + 90)
        .multiply(((hsv.s / 100) * canvas.width) / 2)
        .add(canvas.width / 2, canvas.width / 2)
    );
  }, [primaryColor, secondaryColor, lastColorChanged]);

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

  const handlePickColor = useCallback(
    (x: number, y: number, primary: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let newLoc = new Location(x - rect.x, y - rect.y);

      let direction = newLoc.minus(canvas.width / 2, canvas.height / 2);
      if (direction.magnitude() > canvas.width / 2) {
        direction = direction.normalized().multiply(canvas.width / 2);
      }

      const finalNewLoc = direction.add(canvas.width / 2, canvas.height / 2);

      setMouseLoc(finalNewLoc);

      const hsl = xyToColor(finalNewLoc.x, finalNewLoc.y);
      const rgb = colorsys.hslToRgb(hsl.deg, hsl.sat, hsl.lig);

      if (primary) {
        setPrimaryColor(new Color(rgb.r, rgb.g, rgb.b, 255));
        setLastColorChanged(0);
      } else {
        setSecondaryColor(new Color(rgb.r, rgb.g, rgb.b, 255));
        setLastColorChanged(1);
      }
    },
    [setLastColorChanged, setPrimaryColor, setSecondaryColor]
  );

  useWindowEvent(
    "mousemove",
    useCallback(
      (e: MouseEvent) => {
        if (isMouseDown) {
          handlePickColor(e.clientX, e.clientY, e.buttons == 1);
        }
      },
      [handlePickColor, isMouseDown]
    )
  );

  useWindowEvent(
    "mouseup",
    useCallback(() => {
      setIsMouseDown(false);
    }, [])
  );

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
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
