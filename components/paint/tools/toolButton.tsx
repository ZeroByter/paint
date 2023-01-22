import Tools, { ToolTypes } from "@client/tools";
import Tool from "@client/tools/tool";
import { PaintFetcher } from "components/contexts/paint";
import { selectTool } from "components/contexts/paintUtils";
import { FC } from "react";
import css from "./toolButton.module.scss";

type Props = {
  id: ToolTypes;
  tool: Tool;
};

const ToolButton: FC<Props> = ({ id, tool }) => {
  const contextState = PaintFetcher();

  const handleClick = () => {
    selectTool(contextState, id);
  };

  return (
    <button
      data-active={contextState.activeToolId == id}
      title={tool.tooltip}
      className={css.root}
      onClick={handleClick}
    >
      {tool.text}
    </button>
  );
};

export default ToolButton;
