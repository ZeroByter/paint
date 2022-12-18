import { hslToRgb, rgbToHsl } from "@client/colorUtils";
import Color from "@shared/types/color";
import { FC, useEffect, useRef } from "react";
import { SliderType } from ".";
import ArrowCanvas from "./arrowCanvas";
import css from "./canvas.module.scss";

type Props = {
  type: SliderType;
};

const sliderLength = 255;

const typeColorMap = {
  r: (i: number) => new Color((i / sliderLength) * 255, 0, 0, 255),
  g: (i: number) => new Color(0, (i / sliderLength) * 255, 0, 255),
  b: (i: number) => new Color(0, 0, (i / sliderLength) * 255, 255),
  h: (i: number) => {
    const rgb = hslToRgb(i / sliderLength, 1, 0.5);
    return new Color(rgb[0], rgb[1], rgb[2], 255);
  },
  s: (i: number) => new Color(0, 0, 0, 255),
  v: (i: number) => new Color(0, 0, 0, 255),
  a: (i: number) => new Color(0, 0, 0, 255),
};

const Canvas: FC<Props> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = sliderLength;
    canvas.height = 1;

    for (let i = 0; i < canvas.width; i++) {
      ctx.fillStyle = typeColorMap[type](i).toString();
      ctx.fillRect(i, 0, 1, 1);
    }
  }, []);

  return (
    <div className={css.root}>
      <canvas ref={canvasRef} />
      <ArrowCanvas />
    </div>
  );
};

export default Canvas;
