import BrushTool from "./brushTool";
import ColorPickerTool from "./colorPickerTool";
import EraserTool from "./eraserTool";
import PencilTool from "./pencilTool";
import SelectTool from "./selectTool";
import Tool from "./tool";

export const ToolKeyShortcuts: { [id: string]: string } = {
  KeyE: "eraser",
  KeyS: "select",
  KeyP: "pencil",
  KeyB: "brush",
  KeyK: "colorpicker",
};

const Tools: { [id: string]: Tool } = {
  select: new SelectTool(),
  eraser: new EraserTool(),
  pencil: new PencilTool(),
  brush: new BrushTool(),
  colorpicker: new ColorPickerTool(),
};

export default Tools;
