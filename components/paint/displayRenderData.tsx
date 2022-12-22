import { FC, useEffect, useRef } from "react";

interface DisplayRenderDataProps {
  className: string;
  imageData: ImageData;
}

const DisplayRenderData: FC<DisplayRenderDataProps> = ({
  className,
  imageData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    ctx.putImageData(imageData, 0, 0);

    return () => {};
  }, [imageData]);

  return <canvas className={className} ref={canvasRef} />;
};

export default DisplayRenderData;
