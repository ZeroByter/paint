import { rgbToHsl } from "@client/colorUtils";
import { PaintFetcher } from "components/contexts/paint";
import { FC, useEffect, useState } from "react";
import Canvas from "./canvas";
import css from "./index.module.scss";

export type SliderType = "r" | "g" | "b" | "h" | "s" | "v" | "a";

type Props = {
  type: SliderType;
};

const ColorSlider: FC<Props> = ({ type }) => {
  const [value, setValue] = useState(0);

  const { primaryColor, secondaryColor, lastColorChanged } = PaintFetcher();

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
      const hsl = rgbToHsl(lastColor.r, lastColor.g, lastColor.b);

      if (type == "h") {
        setValue(Math.round(hsl[0] * 360));
      } else if (type == "s") {
        setValue(Math.round(hsl[1] * 100));
      } else if (type == "v") {
        setValue(Math.round(hsl[2] * 100));
      }
    }
  }, [primaryColor, secondaryColor, lastColorChanged, type]);

  return (
    <div className={css.root}>
      <div className={css.typeName}>{type.toUpperCase()}:</div>
      <Canvas type={type} value={value} />
      <input type="number" value={value} />
    </div>
  );
};

export default ColorSlider;
