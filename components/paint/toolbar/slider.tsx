import { ChangeEvent, FC, useMemo, useState } from "react";
import css from "./slider.module.scss";

const Slider: FC = () => {
  const [value, setValue] = useState(1);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.valueAsNumber);
  };

  const styleMemo = useMemo(
    () => ({
      width: `${value}%`,
    }),
    [value]
  );

  return (
    <span className={css.root}>
      <span className={css.track} style={styleMemo}></span>
      <input
        className={css.input}
        type="range"
        value={value}
        onChange={handleChange}
      />
    </span>
  );
};

export default Slider;
