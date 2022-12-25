import { FC } from "react";
import css from "./index.module.scss";
import Slider from "./slider";

const ToolsToolbar: FC = () => {
  return (
    <div className={css.root}>
      <div>
        Size: <input type="number" min={1} max={900} />
      </div>
      <div>
        Hardness: <Slider />
      </div>
    </div>
  );
};

export default ToolsToolbar;
