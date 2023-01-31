import Layer from "@shared/types/layer";
import TemporaryLayer from "@shared/types/temporaryLayer";
import { PaintFetcher } from "components/contexts/paint";
import { getRealScale } from "components/contexts/paintUtils";
import {
  CSSProperties,
  FC,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";
import css from "./canvas.module.scss";

type Props = {
  layer: Layer | TemporaryLayer;
  order: number;
};

const Canvas: FC<Props> = ({ layer, order }) => {
  const paintState = PaintFetcher();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = layer.width;
    canvas.height = layer.height;

    ctxRef.current = ctx;

    ctx.putImageData(
      new ImageData(layer.pixels, layer.width, layer.height),
      0,
      0
    );
  }, [layer.height, layer.pixels, layer.width]);

  useEffect(() => {
    if (layer.pixelsId == layer.id) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.putImageData(
      new ImageData(layer.pixels, layer.width, layer.height),
      0,
      0
    );
  }, [layer.id, layer.pixels, layer.pixelsId, layer.width, layer.height]);

  const handleContextMenu = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const memoStyle: CSSProperties = useMemo(() => {
    const temporaryLayerCSS: CSSProperties =
      layer instanceof TemporaryLayer
        ? {
            width: "auto",
            left: `${layer.x}px`,
            top: `${layer.y}px`,
            zIndex: order + 0.5,
          }
        : {};

    return {
      zIndex: order,
      imageRendering: getRealScale(paintState) > 3 ? "pixelated" : "auto",
      ...temporaryLayerCSS,
    };
  }, [layer, order, paintState]);

  return (
    <canvas
      ref={canvasRef}
      style={memoStyle}
      className={css.root}
      onContextMenu={handleContextMenu}
      data-interactable={true}
    ></canvas>
  );
};

export default Canvas;
