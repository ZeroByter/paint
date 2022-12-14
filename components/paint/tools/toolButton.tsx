import Tool from "@client/tools/tool";
import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import css from "./toolButton.module.scss";

type Props = {
  id: string;
  tool: Tool;
};

const ToolButton: FC<Props> = ({ id, tool }) => {
  const { activeToolId, setActiveToolId } = PaintFetcher();

  return (
    <button
      data-active={activeToolId == id}
      title={tool.tooltip}
      className={css.root}
      onClick={() => setActiveToolId(id)}
    >
      {tool.text}
    </button>
  );
};

export default ToolButton;
