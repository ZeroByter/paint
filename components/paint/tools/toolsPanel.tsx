import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools, { ToolKeyShortcuts } from "@client/tools";
import { PaintFetcher } from "components/contexts/paint";
import { setNotification } from "components/contexts/paintUtils";
import { FC, useCallback } from "react";
import ToolButton from "./toolButton";
import css from "./toolsPanel.module.scss";

const ToolsPanel: FC = () => {
  const paintState = PaintFetcher();
  const { setActiveToolId } = paintState;

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
          setNotification(paintState, `Selected tool '${Tools[tool].tooltip}'`);
        }
      },
      [paintState, setActiveToolId]
    )
  );

  return <div className={css.root}>{renderTools}</div>;
};

export default ToolsPanel;
