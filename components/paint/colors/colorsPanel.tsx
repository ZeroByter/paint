import { FC } from "react";
import css from "./colorsPanel.module.scss";
import ColorsPreview from "./colorsPreview";
import ColorWheel from "./colorWheel";

const ColorsPanel: FC = () => {
  return (
    <div className={css.root}>
      <div className={css.row}>
        <div>pri or sec</div>
        <div>expand</div>
      </div>
      <div className={css.row}>
        <div>
          <ColorsPreview />
        </div>
        <div>
          <ColorWheel />
        </div>
      </div>
      <div className={css.row}>color samples...</div>
    </div>
  );
};

export default ColorsPanel;
