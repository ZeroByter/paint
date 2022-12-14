import Tools from "@client/tools";
import { FC } from "react";
import ToolButton from "./toolButton";
import css from "./toolsPanel.module.scss";

const ToolsPanel: FC = () => {
  const renderTools = Object.entries(Tools).map(([id, tool]) => {
    return <ToolButton key={id} id={id} tool={tool} />;
  });

  return <div className={css.root}>{renderTools}</div>;
};

export default ToolsPanel;
