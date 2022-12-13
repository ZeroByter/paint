import { FC } from "react";
import css from "./colorsPanel.module.scss";
import ColorWheel from "./colorWheel";

const ColorsPanel: FC = () => {
  return (
    <div className={css.root}>
      <div className={css.row}>
        <div>pri or sec</div>
        <div>expand</div>
      </div>
      <div className={css.row}>
        <div>colors preview</div>
        <div>
          <ColorWheel />
        </div>
      </div>
      <div className={css.row}>color samples...</div>
    </div>
  );
};

export default ColorsPanel;
