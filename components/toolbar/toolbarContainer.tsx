import { ToolbarFetcher } from "components/contexts/toolbar";
import { FC } from "react";
import ToolbarButton from "./toolbarButton";
import css from "./toolbarContainer.module.scss";

const ToolbarContainer: FC = () => {
  const { activeMenu, setActiveMenu } = ToolbarFetcher();

  return (
    <div className={css.root}>
      <ToolbarButton
        text="File"
        menuActive={activeMenu === 0}
        setMenuActive={setActiveMenu}
      />
    </div>
  );
};

export default ToolbarContainer;
