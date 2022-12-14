import { createContext, FC, ReactNode, useContext, useState } from "react";

type SelectionContextType = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const SelectionContext = createContext({} as SelectionContextType);

type Props = {
  children: ReactNode;
};

const SelectionProvider: FC<Props> = ({ children }) => {
  const x = 10;
  const y = 10;
  const w = 20;
  const h = 20;

  return (
    <SelectionContext.Provider value={{ x, y, w, h }}>
      {children}
    </SelectionContext.Provider>
  );
};
export default SelectionProvider;

export const SelectionFetcher = () => {
  return useContext(SelectionContext);
};
