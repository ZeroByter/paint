import Location from "@shared/types/location";
import { FC, useMemo } from "react";
import css from "./cursorHandle.module.scss";

type Props = {
  location: Location;
};

const CursorHandle: FC<Props> = ({ location }) => {
  const styledMemo = useMemo(() => {
    return {
      left: `${location.x}px`,
      top: `${location.y}px`,
    };
  }, [location]);

  return <div className={css.root} style={styledMemo}></div>;
};

export default CursorHandle;
