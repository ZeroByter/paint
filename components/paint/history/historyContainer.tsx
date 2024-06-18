import { FC } from "react";
import css from "./historyContainer.module.scss";
import _ from "lodash/fp";
import UndoAction from "@client/undo/undoAction";
import classNames from "classnames";

type Props = {
  undoAction: UndoAction;
  isRedo: boolean;
};

const HistoryContainer: FC<Props> = ({ undoAction, isRedo }) => {
  return (
    <div className={classNames(isRedo && css.isRedo)}>
      {undoAction.constructor.name}
    </div>
  );
};

export default HistoryContainer;
