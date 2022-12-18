import { FC } from "react";
import Canvas from "./canvas";
import css from "./index.module.scss";

export type SliderType = "r" | "g" | "b" | "h" | "s" | "v" | "a";

type Props = {
  type: SliderType;
};

const ColorSlider: FC<Props> = ({ type }) => {
  return (
    <div className={css.root}>
      <div className={css.typeName}>{type.toUpperCase()}:</div>
      <Canvas type={type} />
      <input type="number" />
    </div>
  );
};

export default ColorSlider;
