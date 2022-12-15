import { getDistance } from "@client/utils";
import Location from "@shared/types/location";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class PencilTool extends Tool {
  constructor() {
    super();

    this.text = "P";
    this.tooltip = "Pencil";
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    const { setPixelColor, primaryColor, secondaryColor, mouseLoc } = state;

    const useColor = args.button == 0 ? primaryColor : secondaryColor;

    setPixelColor(
      mouseLoc.x,
      mouseLoc.y,
      useColor.r,
      useColor.g,
      useColor.b,
      useColor.a,
      true
    );
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    const { primaryColor, secondaryColor, setPixelColor } = state;
    const mouseLoc = args.accurateMouseLoc;

    const useColor = args.buttons == 1 ? primaryColor : secondaryColor;

    const lastMouseLoc = args.lastDragLocation.copy();

    const distance = Math.ceil(
      getDistance(mouseLoc.x, mouseLoc.y, lastMouseLoc.x, lastMouseLoc.y)
    );

    const direction = lastMouseLoc.minus(mouseLoc).normalized();

    for (let i = 0; i < distance; i++) {
      const paintLocation = mouseLoc.add(direction.add(direction.multiply(i)));
      setPixelColor(
        Math.round(paintLocation.x),
        Math.round(paintLocation.y),
        useColor.r,
        useColor.g,
        useColor.b,
        useColor.a,
        true
      );
    }
  }
}

export default PencilTool;
