import { FC } from "react";
import css from "./selectionEdge.module.scss";
import SelectionNode from "./selectionNode";

type Props = {
  direction: "up" | "down" | "left" | "right";
};

const SelectionEdge: FC<Props> = ({ direction }) => {
  return (
    <div className={css.root} data-direction={direction}>
      <SelectionNode />
    </div>
  );
};

export default SelectionEdge;
