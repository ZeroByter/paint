import ColorPickerTool from "./colorPickerTool";
import PencilTool from "./pencilTool";
import SelectTool from "./selectTool";
import Tool from "./tool";

const Tools: { [id: string]: Tool } = {
  pencil: new PencilTool(),
  select: new SelectTool(),
  colorPicker: new ColorPickerTool(),
};

export default Tools;
