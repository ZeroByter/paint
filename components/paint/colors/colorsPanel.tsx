import { PaintFetcher } from "components/contexts/paint";
import { ChangeEvent, FC, useState } from "react";
import ColorSlider from "./colorSlider";
import css from "./colorsPanel.module.scss";
import ColorsPreview from "./colorsPreview";
import ColorTemplates from "./colorTemplates";
import ColorWheel from "./colorWheel";
import colorsys from "colorsys";
import Color from "@shared/types/color";

const ColorsPanel: FC = () => {
  const [expanded, setExpanded] = useState(false);

  const { primaryColor, secondaryColor, lastColorChanged, setPrimaryColor } =
    PaintFetcher();
  const lastColor = lastColorChanged == 0 ? primaryColor : secondaryColor;
  const lastColorHex = colorsys.rgbToHex(lastColor).slice(1).toUpperCase();

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rgb = colorsys.hexToRgb(e.target.value);
    if (rgb) setPrimaryColor(new Color(rgb.r, rgb.g, rgb.b, primaryColor.a));
  };

  return (
    <div className={css.root}>
      <div className={css.basicInfo}>
        <div className={css.row}>
          <div>pri or sec</div>
          <div>
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? "< <" : "> >"}
            </button>
          </div>
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
      {expanded && (
        <div className={css.advancedInfo}>
          <div>RGB</div>
          <ColorSlider type="r" />
          <ColorSlider type="g" />
          <ColorSlider type="b" />
          <div>
            Hex:
            <input
              key={lastColor.toString()}
              className={css.hexInput}
              defaultValue={lastColorHex}
              onChange={handleHexChange}
            />
          </div>
          <div>RGB</div>
          <ColorSlider type="h" />
          <ColorSlider type="s" />
          <ColorSlider type="v" />
          <div>Opacity - Alpha</div>
          <ColorSlider type="a" />
        </div>
      )}
    </div>
  );
};

export default ColorsPanel;
