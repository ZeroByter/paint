import { FC } from "react";
import ToolButton from "./toolButton";
import css from "./toolsPanel.module.scss";

const ToolsPanel: FC = () => {
  return (
    <div className={css.root}>
      {/* <ToolButton text="P" onClick={handle} />
      <ToolButton text="S" />
      <ToolButton text="PS" /> */}
    </div>
  );
};

export default ToolsPanel;
