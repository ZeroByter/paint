import ColorPickerTool from "./colorPickerTool";
import EraserTool from "./eraserTool";
import PencilTool from "./pencilTool";
import SelectTool from "./selectTool";
import Tool from "./tool";

export const ToolKeyShortcuts: { [id: string]: string } = {
  KeyE: "eraser",
  KeyS: "select",
  KeyP: "pencil",
  KeyC: "colorpicker",
};

const Tools: { [id: string]: Tool } = {
  pencil: new PencilTool(),
  select: new SelectTool(),
  colorpicker: new ColorPickerTool(),
  eraser: new EraserTool(),
};

export default Tools;
