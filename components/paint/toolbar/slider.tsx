import useWindowEvent from "@client/hooks/useWindowEvent";
import { clamp01 } from "@client/utils";
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import css from "./slider.module.scss";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const Slider: FC<Props> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "hsl(240deg 100% 63%)";
    ctx.fillRect(0, 0, Math.round(value * 100), 1);
  }, [value]);

  const getValueFromX = (x: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const box = canvas.getBoundingClientRect();

    return clamp01((x - box.x) / box.width);
  };

  useWindowEvent(
    "mousemove",
    useCallback(
      (e: MouseEvent<HTMLCanvasElement>) => {
        if (isMouseDown) {
          const newValue = getValueFromX(e.pageX);
          onChange(newValue);
        }
      },
      [isMouseDown, onChange]
    )
  );

  useWindowEvent(
    "mouseup",
    useCallback(() => {
      setIsMouseDown(false);
    }, [setIsMouseDown])
  );

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const newValue = getValueFromX(e.pageX);
    onChange(newValue);
    setIsMouseDown(true);
  };

  return (
    <span className={css.root}>
      <canvas
        className={css.canvas}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
      />
      <div className={css.text}>{Math.round(value * 100)}</div>
    </span>
  );
};

export default Slider;
