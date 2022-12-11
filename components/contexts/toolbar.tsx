import { createContext, FC, ReactNode, useContext, useState } from "react";

type ToolbarContextType = {
  activeMenu: number;
  setActiveMenu: (newActiveMenu: number) => void;
};

const defaultValue: ToolbarContextType = {
  activeMenu: -1,
  setActiveMenu: () => {},
};

export const ToolbarContext = createContext<ToolbarContextType>(defaultValue);

type Props = {
  children: ReactNode;
};

const ToolbarProvider: FC<Props> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(-1);

  return (
    <ToolbarContext.Provider value={{ activeMenu, setActiveMenu }}>
      {children}
    </ToolbarContext.Provider>
  );
};
export default ToolbarProvider;

export const ToolbarFetcher = () => {
  return useContext(ToolbarContext);
};
