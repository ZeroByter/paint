import { FC, ReactElement } from "react";

type Props = {
  children: ReactElement;
};

//TODO: Handle moving selection corners here...

const SelectionAdjust: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

export default SelectionAdjust;
