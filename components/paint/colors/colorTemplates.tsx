import Color from "@shared/types/color";
import { FC, useMemo } from "react";
import ColorTemplate from "./colorTemplate";
import css from "./colorTemplates.module.scss";

const ColorTemplates: FC = () => {
  const renderTopColors = useMemo(() => {
    const templates = [];

    templates.push(<ColorTemplate key={0} deg={0} sat={0} lig={0} />);
    templates.push(<ColorTemplate key={1} deg={0} sat={0} />);

    for (let i = 0; i < 14; i++) {
      templates.push(
        <ColorTemplate key={2 + i} deg={(i / 14) * 360} sat={100} />
      );
    }

    return templates;
  }, []);

  const renderBottomColors = useMemo(() => {
    const templates = [];

    templates.push(<ColorTemplate key={0} deg={0} sat={0} lig={100} />);
    templates.push(<ColorTemplate key={1} deg={0} sat={0} lig={75} />);

    for (let i = 0; i < 14; i++) {
      templates.push(
        <ColorTemplate key={2 + i} deg={(i / 14) * 360} sat={100} lig={25} />
      );
    }

    return templates;
  }, []);

  return (
    <div className={css.root}>
      <div className={css.row}>{renderTopColors}</div>
      <div className={css.row}>{renderBottomColors}</div>
    </div>
  );
};

export default ColorTemplates;
