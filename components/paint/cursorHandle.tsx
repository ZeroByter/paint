import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { FC, useMemo } from "react";
import css from "./cursorHandle.module.scss";

const CursorHandle: FC = () => {
  const { mouseScaledLoc, scale } = PaintFetcher();

  const styledMemo = useMemo(() => {
    return {
      width: `${scale}px`,
      left: `${mouseScaledLoc.x}px`,
      top: `${mouseScaledLoc.y}px`,
    };
  }, [mouseScaledLoc, scale]);

  return <div className={css.root} style={styledMemo}></div>;
};

export default CursorHandle;
