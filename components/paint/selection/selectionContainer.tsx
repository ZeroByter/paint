import { PaintFetcher } from "components/contexts/paint";
import { FC, useMemo } from "react";
import css from "./selectionContainer.module.scss";
import SelectionEdge from "./selectionEdge";

const SelectionContainer: FC = () => {
  const { width, height, offset, getRealScale } = PaintFetcher();

  const x = 10;
  const y = 10;
  const w = 20;
  const h = 20;

  const memoStyle = useMemo(() => {
    const scale = getRealScale();

    return {
      left: `${(width / -2 + offset.x + x) * scale}px`,
      top: `${(height / -2 + offset.y + y) * scale}px`,
      width: `${w * scale}px`,
      height: `${h * scale}px`,
    };
  }, [getRealScale, height, offset.x, offset.y, width]);

  return (
    <div className={css.root} style={memoStyle}>
      <SelectionEdge direction="up" />
      <SelectionEdge direction="down" />
      <SelectionEdge direction="left" />
      <SelectionEdge direction="right" />
    </div>
  );
};

export default SelectionContainer;
