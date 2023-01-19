import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools, { ToolKeyShortcuts } from "@client/tools";
import { PaintFetcher } from "components/contexts/paint";
import { setNotification } from "components/contexts/paintUtils";
import { isArray } from "lodash/fp";
import { FC, useCallback } from "react";
import ToolButton from "./toolButton";
import css from "./toolsPanel.module.scss";

const ToolsPanel: FC = () => {
  const paintState = PaintFetcher();
  const { setActiveToolId, activeToolId } = paintState;

  const renderTools = Object.entries(Tools).map(([id, tool]) => {
    return <ToolButton key={id} id={id} tool={tool} />;
  });

  useWindowEvent(
    "keydown",
    useCallback(
      (e: KeyboardEvent) => {
        const tool = ToolKeyShortcuts[e.code];
        if (tool) {
          Tools[activeToolId].onUnselect(paintState);

          if (isArray(tool)) {
            let newToolId = "";

            if (tool.includes(activeToolId)) {
              newToolId = tool[(tool.indexOf(activeToolId) + 1) % tool.length];
            } else {
              newToolId = tool[0];
            }

            setActiveToolId(newToolId);
            Tools[newToolId].onSelect(paintState);

            setNotification(
              paintState,
              `Selected tool '${Tools[newToolId].tooltip}'`
            );
          } else {
            setActiveToolId(tool);
            Tools[tool].onSelect(paintState);

            setNotification(
              paintState,
              `Selected tool '${Tools[tool].tooltip}'`
            );
          }
        }
      },
      [activeToolId, paintState, setActiveToolId]
    )
  );

  return <div className={css.root}>{renderTools}</div>;
};

export default ToolsPanel;
