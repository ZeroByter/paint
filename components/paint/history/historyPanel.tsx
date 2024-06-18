import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import HistoryContainer from "./historyContainer";
import css from "./historyPanel.module.scss";

const HistoryPanel: FC = () => {
  const paintState = PaintFetcher();
  const { undoActions, redoActions } = paintState;

  const renderRedoActions = redoActions.current
    .map((redoAction) => {
      return (
        <HistoryContainer
          key={redoAction.id}
          undoAction={redoAction}
          isRedo={true}
        />
      );
    })
    .toReversed();

  const renderUndoActions = undoActions.current.map((undoAction) => {
    return (
      <HistoryContainer
        key={undoAction.id}
        undoAction={undoAction}
        isRedo={false}
      />
    );
  });

  return (
    <div className={css.root}>
      <div>history:</div>
      <div className={css.layers}>
        {renderUndoActions}
        {renderRedoActions}
      </div>
    </div>
  );
};

export default HistoryPanel;
