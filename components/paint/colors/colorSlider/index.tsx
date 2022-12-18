import { clamp } from "@client/utils";
import { PaintFetcher } from "components/contexts/paint";
import { ChangeEvent, FC, useEffect, useState } from "react";
import Canvas from "./canvas";
import css from "./index.module.scss";
import colorsys from "colorsys";

export type SliderType = "r" | "g" | "b" | "h" | "s" | "v" | "a";

export const specialMaxValue: any = {
  h: 360,
  s: 100,
  v: 100,
};

type Props = {
  type: SliderType;
};

const ColorSlider: FC<Props> = ({ type }) => {
  const [value, setValue] = useState(0);

  const { primaryColor, setPrimaryColor, secondaryColor, lastColorChanged } =
    PaintFetcher();

  useEffect(() => {
    const lastColor = lastColorChanged == 0 ? primaryColor : secondaryColor;

    if (type == "r") {
      setValue(lastColor.r);
    } else if (type == "g") {
      setValue(lastColor.g);
    } else if (type == "b") {
      setValue(lastColor.b);
    } else if (type == "a") {
      setValue(lastColor.a);
    } else {
      const hsl = colorsys.rgbToHsv(lastColor.r, lastColor.g, lastColor.b);

      if (type == "h") {
        setValue(Math.round(hsl.h));
      } else if (type == "s") {
        setValue(Math.round(hsl.s));
      } else if (type == "v") {
        setValue(Math.round(hsl.v));
      }
    }
  }, [primaryColor, secondaryColor, lastColorChanged, type]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = clamp(
      e.target.valueAsNumber,
      0,
      specialMaxValue[type] ?? 255
    );

    switch (type) {
      case "r":
        setPrimaryColor(primaryColor.set(0, value));
        break;
      case "g":
        setPrimaryColor(primaryColor.set(1, value));
        break;
      case "b":
        setPrimaryColor(primaryColor.set(2, value));
        break;
      case "a":
        setPrimaryColor(primaryColor.set(3, value));
        break;
    }
  };

  return (
    <div className={css.root}>
      <div className={css.typeName}>{type.toUpperCase()}:</div>
      <Canvas type={type} value={value} />
      <input type="number" value={value} onChange={handleInputChange} />
    </div>
  );
};

export default ColorSlider;
