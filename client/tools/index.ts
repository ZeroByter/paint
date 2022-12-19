import ColorPickerTool from "./colorPickerTool";
import EraserTool from "./eraserTool";
import PencilTool from "./pencilTool";
import SelectTool from "./selectTool";
import Tool from "./tool";

const Tools: { [id: string]: Tool } = {
  pencil: new PencilTool(),
  select: new SelectTool(),
  colorPicker: new ColorPickerTool(),
  eraser: new EraserTool(),
};

export default Tools;
