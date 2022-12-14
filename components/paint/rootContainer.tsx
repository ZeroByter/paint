import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent, ReactNode, useState } from "react";
import css from "./rootContainer.module.scss";

type Props = {
  children: ReactNode;
};

const RootContainer: FC<Props> = ({ children }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDragStart, setMouseDragStart] = useState(new Location());
  const [mouseDragContainerPosStart, setMouseDragContainerPosStart] = useState(
    new Location()
  );

  const { offset, setOffset, getRealScale } = PaintFetcher();

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);
    setMouseDragStart(new Location(e.clientX, e.clientY));
    setMouseDragContainerPosStart({ ...offset });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMouseDown) {
      if (e.buttons == 4) {
        const realScale = getRealScale();

        setOffset(
          new Location(
            mouseDragContainerPosStart.x +
              (e.clientX - mouseDragStart.x) / realScale,

            mouseDragContainerPosStart.y +
              (e.clientY - mouseDragStart.y) / realScale
          )
        );
      }
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  return (
    <div
      className={css.root}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default RootContainer;
