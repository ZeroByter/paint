import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import HistoryContainer from "./historyContainer";
import css from "./historyPanel.module.scss";

const HistoryPanel: FC = () => {
  const paintState = PaintFetcher();
  const { undoActions } = paintState;

  const renderLayers = undoActions.current.map((undoAction) => {
    return <HistoryContainer key={undoAction.id} undoAction={undoAction} />;
  });

  return (
    <div className={css.root}>
      <div>history:</div>
      <div className={css.layers}>{renderLayers}</div>
    </div>
  );
};

export default HistoryPanel;
