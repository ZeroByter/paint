import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools, { ToolKeyShortcuts } from "@client/tools";
import { PaintFetcher } from "components/contexts/paint";
import { FC, useCallback } from "react";
import ToolButton from "./toolButton";
import css from "./toolsPanel.module.scss";

const ToolsPanel: FC = () => {
  const { setActiveToolId } = PaintFetcher();

  const renderTools = Object.entries(Tools).map(([id, tool]) => {
    return <ToolButton key={id} id={id} tool={tool} />;
  });

  useWindowEvent(
    "keydown",
    useCallback(
      (e: KeyboardEvent) => {
        const tool = ToolKeyShortcuts[e.code];
        if (tool) {
          setActiveToolId(tool);
        }
      },
      [setActiveToolId]
    )
  );

  return <div className={css.root}>{renderTools}</div>;
};

export default ToolsPanel;
