import { FC } from "react";
import css from "./selectionEdge.module.scss";
import SelectionNode from "./selectionNode";

type Props = {
  direction: "up" | "down" | "left" | "right";
  index: number;
  isHover: (index: number, hover: boolean) => void;
};

const SelectionEdge: FC<Props> = ({ direction, index, isHover }) => {
  return (
    <div className={css.root} data-direction={direction}>
      <SelectionNode
        direction={direction}
        isHover={(hover: boolean) => isHover(index, hover)}
      />
    </div>
  );
};

export default SelectionEdge;
