import Tools from "@client/tools";
import Tool from "@client/tools/tool";
import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import css from "./toolButton.module.scss";

type Props = {
  id: string;
  tool: Tool;
};

const ToolButton: FC<Props> = ({ id, tool }) => {
  const contextState = PaintFetcher();

  const handleClick = () => {
    Tools[contextState.activeToolId].onUnselect(contextState);

    contextState.setActiveToolId(id);

    Tools[id].onSelect(contextState);
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
