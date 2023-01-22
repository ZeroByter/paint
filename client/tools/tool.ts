import Location from "@shared/types/location";
import { PaintContextType } from "components/contexts/paint";

export type OnClickArgs = {
  button: number;
};

export type OnDragArgs = {
  buttons: number;
  lastDragLocation: Location;
  accurateMouseLoc: Location;
};

export type OnKeyDownArgs = {
  code: string;
};

class Tool {
  text = "";
  tooltip = "";
  hidden = false;

  onSelect(state: PaintContextType) {}
  onUnselect(state: PaintContextType) {}

  onMouseDown(state: PaintContextType, args: OnClickArgs) {}
  onMouseUp(state: PaintContextType, args: OnClickArgs) {}

  onKeyDown(state: PaintContextType, args: OnKeyDownArgs) {}

  onDrag(state: PaintContextType, args: OnDragArgs) {}
}

export default Tool;
