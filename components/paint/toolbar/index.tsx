import useWindowEvent from "@client/hooks/useWindowEvent";
import { clamp } from "@client/utils";
import { PaintFetcher } from "components/contexts/paint";
import { ChangeEvent, FC } from "react";
import css from "./index.module.scss";
import Slider from "./slider";

const ToolsToolbar: FC = () => {
  const { brushSize, setBrushSize, brushHardness, setBrushHardness } =
    PaintFetcher();

  const handleBrushSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBrushSize(clamp(e.target.valueAsNumber, 1, 900));
  };

  useWindowEvent("keydown", (e: KeyboardEvent) => {
    const modifier = e.ctrlKey ? 5 : 1;

    if (e.code == "BracketLeft") {
      setBrushSize(clamp(brushSize - modifier, 1, 900));
    } else if (e.code == "BracketRight") {
      setBrushSize(clamp(brushSize + modifier, 1, 900));
    }
  });

  return (
    <div className={css.root}>
      <div>
        Size:{" "}
        <input
          type="number"
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
      </div>
      <div>
        Hardness: <Slider value={brushHardness} onChange={setBrushHardness} />
      </div>
    </div>
  );
};

export default ToolsToolbar;
