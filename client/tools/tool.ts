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

class Tool {
  id: string; //has to be the same as index of tool in tools/index.ts!

  constructor(id: string) {
    this.id = id;
  }

  onClick(state: PaintContextType, args: OnClickArgs) {}

  onDrag(state: PaintContextType, args: OnDragArgs) {}
}

export default Tool;
