import Layer from "@shared/types/layer";
import { FC, useEffect, useMemo, useRef } from "react";
import css from "./canvas.module.scss";

type Props = {
  layer: Layer;
};

const Canvas: FC<Props> = ({ layer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = layer.width;
    canvas.height = layer.height;

    ctxRef.current = ctx;

    ctx.putImageData(new ImageData(layer.pixels, 50, 50), 0, 0);
  }, []);

  useEffect(() => {
    if (layer.pixelsId == layer.id) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.putImageData(new ImageData(layer.pixels, 50, 50), 0, 0);
  }, [layer.id, layer.pixels, layer.pixelsId]);

  return <canvas ref={canvasRef} className={css.root}></canvas>;
};

export default Canvas;
