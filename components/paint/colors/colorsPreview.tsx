import { PaintFetcher } from "components/contexts/paint";
import { FC, useMemo } from "react";
import css from "./colorsPreview.module.scss";

const ColorsPreview: FC = () => {
  const { primaryColor, secondaryColor } = PaintFetcher();

  const primaryPreviewStyle = useMemo(
    () => ({
      background: primaryColor.toString(),
    }),
    [primaryColor]
  );

  const secondaryPreviewStyle = useMemo(
    () => ({
      background: secondaryColor.toString(),
    }),
    [secondaryColor]
  );

  return (
    <div className={css.root}>
      <div>
        <div className={css.primaryColor} style={primaryPreviewStyle}></div>
        <div className={css.secondaryColor} style={secondaryPreviewStyle}></div>
      </div>
    </div>
  );
};

export default ColorsPreview;
