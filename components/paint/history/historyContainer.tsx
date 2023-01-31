import { ChangeEvent, FC } from "react";
import css from "./historyContainer.module.scss";
import _, { set } from "lodash/fp";
import { PaintFetcher } from "components/contexts/paint";
import { setActiveLayers } from "components/contexts/paintUtils";
import UndoAction from "@client/undo/undoAction";

type Props = {
  undoAction: UndoAction;
};

const HistoryContainer: FC<Props> = ({ undoAction }) => {
  const paintState = PaintFetcher();

  return <div className={css.root}>{undoAction.constructor.name}</div>;
};

export default HistoryContainer;
