import { createContext, FC, ReactNode, useContext, useState } from "react";

type TemplateContextType = {};

export const TemplateContext = createContext({} as TemplateContextType);

type Props = {
  children: ReactNode;
};

const TemplateProvider: FC<Props> = ({ children }) => {
  return (
    <TemplateContext.Provider value={{}}>{children}</TemplateContext.Provider>
  );
};
export default TemplateProvider;

export const TemplateFetcher = () => {
  return useContext(TemplateContext);
};
