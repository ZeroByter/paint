import Location from "@shared/types/location";
import { PaintFetcher } from "components/contexts/paint";
import { FC, MouseEvent, ReactElement, useState } from "react";
import css from "./rootContainer.module.scss";

type Props = {
  children: ReactElement;
};

const RootContainer: FC<Props> = ({ children }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDragStart, setMouseDragStart] = useState<Location>({
    x: 0,
    y: 0,
  });
  const [mouseDragContainerPosStart, setMouseDragContainerPosStart] =
    useState<Location>({
      x: 0,
      y: 0,
    });

  const {
    offset,
    setOffset,
    setMouseLoc,
    setMouseScaledLoc,
    layers,
    activeLayers,
    mouseLoc,
    getRealScale,
  } = PaintFetcher();

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);
    setMouseDragStart({ x: e.clientX, y: e.clientY });
    setMouseDragContainerPosStart({ ...offset });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMouseDown) {
      if (e.buttons == 4) {
        setOffset({
          x: mouseDragContainerPosStart.x + (e.clientX - mouseDragStart.x),
          y: mouseDragContainerPosStart.y + (e.clientY - mouseDragStart.y),
        });
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
