import useWindowEvent from "@client/hooks/useWindowEvent";
import Tools, { ToolKeyShortcuts, ToolTypes } from "@client/tools";
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
    if (tool.hidden) return null;
    return <ToolButton key={id} id={id as ToolTypes} tool={tool} />;
  });

  useWindowEvent(
    "keydown",
    useCallback(
      (e: KeyboardEvent) => {
        const tool = Tools[activeToolId];

        tool.onKeyDown(paintState, { code: e.code });
      },
      [activeToolId, paintState]
    )
  );

  useWindowEvent(
    "keydown",
    useCallback(
      (e: KeyboardEvent) => {
        if (e.ctrlKey) return;

        const tool = ToolKeyShortcuts[e.code];
        if (tool) {
          Tools[activeToolId].onUnselect(paintState);

          if (isArray(tool)) {
            let newToolId: ToolTypes;

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
