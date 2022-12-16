import { clamp, getDistance, ilerp, lerp } from "@client/utils";
import Location from "@shared/types/location";
import Selection from "@shared/types/selection";
import { PaintFetcher } from "components/contexts/paint";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactElement,
  MouseEvent as ReactMouseEvent,
} from "react";

type Props = {
  children: ReactElement;
  hoverIndex: number;
};

//TODO: Handle moving selection corners here...

const SelectionAdjust: FC<Props> = ({ children, hoverIndex }) => {
  const isMouseDownRef = useRef(false);
  const mouseStartHoverIndex = useRef(0);
  const mouseStartDragMousePos = useRef(new Location());
  const mouseStartDragSelection = useRef(new Selection());

  const { getRealScale, width, height, offset, selection, setSelection } =
    PaintFetcher();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMouseDownRef.current) {
        const scale = getRealScale();
        const offset = new Location(e.clientX, e.clientY)
          .minus(mouseStartDragMousePos.current)
          .divide(scale);
        const selectionStart = mouseStartDragSelection.current;
        const index = mouseStartHoverIndex.current;

        switch (index) {
          case 1:
            //up
            setSelection(
              new Selection(
                selection.x,
                selectionStart.y +
                  clamp(
                    Math.round(offset.y),
                    -selectionStart.y,
                    selectionStart.height
                  ),
                selection.width,
                clamp(
                  selectionStart.height - Math.round(offset.y),
                  0,
                  selectionStart.height + selectionStart.y
                )
              )
            );
            break;
          case 2:
            //down
            setSelection(
              new Selection(
                selection.x,
                selection.y,
                selection.width,
                clamp(
                  selectionStart.height + Math.round(offset.y),
                  0,
                  height - selection.y
                )
              )
            );
            break;
          case 4:
            //left
            setSelection(
              new Selection(
                selectionStart.x +
                  clamp(
                    Math.round(offset.x),
                    -selectionStart.x,
                    selectionStart.width
                  ),
                selection.y,
                clamp(
                  selectionStart.width - Math.round(offset.x),
                  0,
                  selectionStart.width + selectionStart.x
                ),
                selection.height
              )
            );
            break;
          case 8:
            //right
            setSelection(
              new Selection(
                selection.x,
                selection.y,
                clamp(
                  selectionStart.width + Math.round(offset.x),
                  0,
                  width - selection.x
                ),
                selection.height
              )
            );
            break;
          case 5:
            //up left
            setSelection(
              new Selection(
                selectionStart.x +
                  clamp(
                    Math.round(offset.x),
                    -selectionStart.x,
                    selectionStart.width
                  ),
                selectionStart.y +
                  clamp(
                    Math.round(offset.y),
                    -selectionStart.y,
                    selectionStart.height
                  ),
                clamp(
                  selectionStart.width - Math.round(offset.x),
                  0,
                  selectionStart.width + selectionStart.x
                ),
                clamp(
                  selectionStart.height - Math.round(offset.y),
                  0,
                  selectionStart.height + selectionStart.y
                )
              )
            );
            break;
          case 6:
            //down left
            setSelection(
              new Selection(
                selectionStart.x +
                  clamp(
                    Math.round(offset.x),
                    -selectionStart.x,
                    selectionStart.width
                  ),
                selection.y,
                clamp(
                  selectionStart.width - Math.round(offset.x),
                  0,
                  selectionStart.width + selectionStart.x
                ),
                clamp(
                  selectionStart.height + Math.round(offset.y),
                  0,
                  height - selection.y
                )
              )
            );
            break;
          case 9:
            //up right
            setSelection(
              new Selection(
                selection.x,
                selectionStart.y +
                  clamp(
                    Math.round(offset.y),
                    -selectionStart.y,
                    selectionStart.height
                  ),
                clamp(
                  selectionStart.width + Math.round(offset.x),
                  0,
                  width - selection.x
                ),
                clamp(
                  selectionStart.height - Math.round(offset.y),
                  0,
                  selectionStart.height + selectionStart.y
                )
              )
            );
            break;
          case 10:
            //down right
            setSelection(
              new Selection(
                selection.x,
                selection.y,
                clamp(
                  selectionStart.width + Math.round(offset.x),
                  0,
                  width - selection.x
                ),
                clamp(
                  selectionStart.height + Math.round(offset.y),
                  0,
                  height - selection.y
                )
              )
            );
            break;
          default:
            break;
        }
      }
    },
    [getRealScale, height, selection, setSelection, width]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button != 0) return;

    isMouseDownRef.current = true;
    mouseStartHoverIndex.current = hoverIndex;
    mouseStartDragMousePos.current = new Location(e.clientX, e.clientY);
    mouseStartDragSelection.current = selection.copy();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  return <div onMouseDown={handleMouseDown}>{children}</div>;
};

export default SelectionAdjust;
