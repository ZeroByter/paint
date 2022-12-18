import { PaintFetcher } from "components/contexts/paint";
import { FC, useEffect, useRef } from "react";
import css from "./transparencyBackground.module.scss";

const TransparencyBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { width, height } = PaintFetcher();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newPixels = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const x = i % width;
      const y = Math.floor(i / width);

      if ((x + y) % 2 == 0) {
        newPixels[i * 4] = 202;
        newPixels[i * 4 + 1] = 202;
        newPixels[i * 4 + 2] = 202;
        newPixels[i * 4 + 3] = 255;
      } else {
        newPixels[i * 4] = 240;
        newPixels[i * 4 + 1] = 240;
        newPixels[i * 4 + 2] = 240;
        newPixels[i * 4 + 3] = 255;
      }
    }

    ctx.putImageData(new ImageData(newPixels, width, height), 0, 0);
  }, [width, height]);

  return <canvas ref={canvasRef} className={css.root} />;
};

export default TransparencyBackground;
