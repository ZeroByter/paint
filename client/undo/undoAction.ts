import { randomString } from "@shared/utils";
import { PaintContextType } from "components/contexts/paint";

export default class UndoAction {
  id = randomString();

  undo(state: PaintContextType) {}
  redo(state: PaintContextType) {}
}
