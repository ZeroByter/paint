import { FC } from "react";
import ColorSlider from "./colorSlider";
import css from "./colorsPanel.module.scss";
import ColorsPreview from "./colorsPreview";
import ColorTemplates from "./colorTemplates";
import ColorWheel from "./colorWheel";

const ColorsPanel: FC = () => {
  return (
    <div className={css.root}>
      <div className={css.basicInfo}>
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
      <div className={css.advancedInfo}>
        <div>RGB</div>
        <ColorSlider type="r" />
        <ColorSlider type="g" />
        <ColorSlider type="b" />
        <div>
          Hex:
          <input />
        </div>
        <div>RGB</div>
        <ColorSlider type="h" />
        <ColorSlider type="s" />
        <ColorSlider type="v" />
        <div>Opacity - Alpha</div>
        <ColorSlider type="a" />
      </div>
    </div>
  );
};

export default ColorsPanel;
