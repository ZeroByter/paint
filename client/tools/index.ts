import BrushTool from "./brushTool";
import ColorPickerTool from "./colorPickerTool";
import EraserTool from "./eraserTool";
import PencilTool from "./pencilTool";
import ProjectionSelectTool from "./projectionSelectionTool";
import SelectHardMoveTool from "./selectHardMoveTool";
import SelectSoftMoveTool from "./selectSoftMoveTool";
import SelectTool from "./selectTool";

export const ToolKeyShortcuts: { [id: string]: ToolTypes | ToolTypes[] } = {
  KeyE: "eraser",
  KeyS: "select",
  KeyP: "pencil",
  KeyB: "brush",
  KeyK: "colorpicker",
  KeyM: ["selectSoftMove", "selectHardMove"],
};

const Tools = {
  //hidden tools
  projectionSelect: new ProjectionSelectTool(),
  //normal visible tools
  select: new SelectTool(),
  selectSoftMove: new SelectSoftMoveTool(),
  brush: new BrushTool(),
  selectHardMove: new SelectHardMoveTool(),
  pencil: new PencilTool(),
  eraser: new EraserTool(),
  colorpicker: new ColorPickerTool(),
};

export type ToolTypes = keyof typeof Tools;

export default Tools;
