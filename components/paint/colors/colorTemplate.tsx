import Color from "@shared/types/color";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent, useMemo } from "react";
import css from "./colorTemplate.module.scss";
import colorsys from "colorsys";

type Props = {
  deg: number;
  sat: number;
  lig?: number;
};

const ColorTemplate: FC<Props> = ({ deg, sat, lig = 50 }) => {
  const { setPrimaryColor, setSecondaryColor, setLastColorChanged } =
    PaintFetcher();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rgb = colorsys.hslToRgb(deg, sat, lig);
    if (e.button == 0) {
      setPrimaryColor(new Color(rgb.r, rgb.g, rgb.b, 255));
      setLastColorChanged(0);
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    const rgb = colorsys.hslToRgb(deg, sat, lig);
    setSecondaryColor(new Color(rgb.r, rgb.g, rgb.b, 255));
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
