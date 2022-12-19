import Color from "@shared/types/color";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { SliderType, specialMaxValue } from ".";
import ArrowCanvas from "./arrowCanvas";
import css from "./canvas.module.scss";
import colorsys from "colorsys";
import { PaintFetcher } from "components/contexts/paint";
import useWindowEvent from "@client/hooks/useWindowEvent";
import { clamp01 } from "@client/utils";

type Props = {
  type: SliderType;
  value: number;
};

const sliderLength = 255;

const white = new Color(255, 255, 255, 255);
const black = new Color(0, 0, 0, 255);

const typeColorMap = {
  r: (i: number, currentColor: Color) =>
    new Color((i / sliderLength) * 255, 0, 0, 255),
  g: (i: number, currentColor: Color) =>
    new Color(0, (i / sliderLength) * 255, 0, 255),
  b: (i: number, currentColor: Color) =>
    new Color(0, 0, (i / sliderLength) * 255, 255),
  h: (i: number, currentColor: Color) => {
    const rgb = colorsys.hslToRgb((i / sliderLength) * 360, 100, 50);
    return new Color(rgb.r, rgb.g, rgb.b, 255);
  },
  s: (i: number, currentColor: Color) =>
    white.lerp(currentColor, i / sliderLength),
  v: (i: number, currentColor: Color) =>
    black.lerp(currentColor, i / sliderLength),
  a: (i: number, currentColor: Color) =>
    new Color(
      ((sliderLength - i) / sliderLength) * 255,
      ((sliderLength - i) / sliderLength) * 255,
      ((sliderLength - i) / sliderLength) * 255,
      255
    ),
};

const Canvas: FC<Props> = ({ type, value }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const { primaryColor, setPrimaryColor, secondaryColor, lastColorChanged } =
    PaintFetcher();

  const getLastColor = useCallback(() => {
    return lastColorChanged == 0 ? primaryColor : secondaryColor;
  }, [lastColorChanged, primaryColor, secondaryColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lastColor = getLastColor();

    canvas.width = sliderLength;
    canvas.height = 1;

    for (let i = 0; i < canvas.width; i++) {
      ctx.fillStyle = typeColorMap[type](i, lastColor).toString();
      ctx.fillRect(i, 0, 1, 1);
    }
  }, [getLastColor, lastColorChanged, primaryColor, secondaryColor, type]);

  useWindowEvent(
    "mousemove",
    useCallback(
      (e: MouseEvent) => {
        const root = rootRef.current;
        if (!root) return;
        if (!isMouseDown) return;

        const rect = root.getBoundingClientRect();

        const value = clamp01((e.clientX - rect.x) / rect.width);

        if (type == "r") {
          setPrimaryColor(primaryColor.set(0, Math.round(value * 255)));
        } else if (type == "g") {
          setPrimaryColor(primaryColor.set(1, Math.round(value * 255)));
        } else if (type == "b") {
          setPrimaryColor(primaryColor.set(2, Math.round(value * 255)));
        } else if (type == "a") {
          setPrimaryColor(primaryColor.set(3, Math.round(value * 255)));
        } else {
          const hsv = colorsys.rgbToHsv(primaryColor);
          hsv[type] = Math.round(value * specialMaxValue[type]);
          const rgb = colorsys.hsvToRgb(hsv);
          setPrimaryColor(new Color(rgb.r, rgb.g, rgb.b, primaryColor.a));
        }
      },
      [isMouseDown, primaryColor, setPrimaryColor, type]
    )
  );

  useWindowEvent(
    "mouseup",
    useCallback(() => {
      setIsMouseDown(false);
    }, [])
  );

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  return (
    <div ref={rootRef} className={css.root} onMouseDown={handleMouseDown}>
      <canvas ref={canvasRef} />
      <ArrowCanvas value={(value / (specialMaxValue[type] ?? 255)) * 100} />
    </div>
  );
};

export default Canvas;
