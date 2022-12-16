import { getDistance } from "@client/utils";
import Color from "@shared/types/color";
import Location from "@shared/types/location";
import { PaintContextType, PaintFetcher } from "components/contexts/paint";
import Tool, { OnClickArgs, OnDragArgs } from "./tool";

class ColorPickerTool extends Tool {
  constructor() {
    super();

    this.text = "C";
    this.tooltip = "Colorpicker";
  }

  selectColor(state: PaintContextType, primary: boolean) {
    const {
      layers,
      mouseLoc,
      width,
      setPrimaryColor,
      setSecondaryColor,
      isMouseInsideImage,
    } = state;

    if (!isMouseInsideImage()) return;

    for (const layer of layers) {
      if (layer.active) {
        const index = mouseLoc.x + mouseLoc.y * width;

        const r = layer.pixels[index * 4];
        const g = layer.pixels[index * 4 + 1];
        const b = layer.pixels[index * 4 + 2];
        const a = layer.pixels[index * 4 + 3];

        if (primary) {
          setPrimaryColor(new Color(r, g, b, a));
        } else {
          setSecondaryColor(new Color(r, g, b, a));
        }

        break;
      }
    }
  }

  onMouseDown(state: PaintContextType, args: OnClickArgs): void {
    this.selectColor(state, args.button == 0);
  }

  onDrag(state: PaintContextType, args: OnDragArgs): void {
    this.selectColor(state, args.buttons == 1);
  }
}

export default ColorPickerTool;
