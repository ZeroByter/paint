import { FC } from "react";
import css from "./colorsPanel.module.scss";
import ColorsPreview from "./colorsPreview";
import ColorTemplates from "./colorTemplates";
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
      <div className={css.row}>
        <ColorTemplates />
      </div>
    </div>
  );
};

export default ColorsPanel;
