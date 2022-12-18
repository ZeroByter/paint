import { hslToRgb } from "@client/colorUtils";
import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent, useMemo } from "react";
import css from "./colorTemplate.module.scss";

type Props = {
  deg: number;
  sat: number;
  lig?: number;
};

const ColorTemplate: FC<Props> = ({ deg, sat, lig = 50 }) => {
  const { setPrimaryColor, setSecondaryColor, setLastColorChanged } =
    PaintFetcher();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rgb = hslToRgb(deg / 360, sat / 100, lig / 100);
    if (e.button == 0) {
      setPrimaryColor(new Color(rgb[0], rgb[1], rgb[2], 255));
      setLastColorChanged(0);
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    const rgb = hslToRgb(deg / 360, sat / 100, lig / 100);
    setSecondaryColor(new Color(rgb[0], rgb[1], rgb[2], 255));
    setLastColorChanged(1);
    e.preventDefault();
  };

  const memoStyle = useMemo(
    () => ({
      background: `hsl(${deg}deg ${sat}% ${lig}%)`,
    }),
    [deg, sat, lig]
  );

  return (
    <div
      className={css.root}
      style={memoStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    ></div>
  );
};

export default ColorTemplate;
