import BrushTool from "./brushTool";
import ColorPickerTool from "./colorPickerTool";
import EraserTool from "./eraserTool";
import PencilTool from "./pencilTool";
import SelectHardMoveTool from "./selectHardMoveTool";
import SelectSoftMoveTool from "./selectSoftMoveTool";
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
  selectSoftMove: new SelectSoftMoveTool(),
  brush: new BrushTool(),
  selectHardMove: new SelectHardMoveTool(),
  pencil: new PencilTool(),
  eraser: new EraserTool(),
  colorpicker: new ColorPickerTool(),
};

export default Tools;
