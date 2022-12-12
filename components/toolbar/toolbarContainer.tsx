import ClickOutside from "components/shared/clickOutside";
import { ToolbarFetcher } from "components/contexts/toolbar";
import { FC } from "react";
import ToolbarButton from "./toolbarButton";
import css from "./toolbarContainer.module.scss";

export type MenuItem = {
  text: string;
  subItems: MenuSubItem[];
};

export type MenuSubItem = {
  text: string;
  onClick: () => void;
};

type Props = {
  menuItems: MenuItem[];
};

const ToolbarContainer: FC<Props> = ({ menuItems }) => {
  const { activeMenu, setActiveMenu } = ToolbarFetcher();

  const handleClickOutside = () => {
    setActiveMenu(-1);
  };

  const renderMenuItems = menuItems.map((menuItem, index) => {
    return (
      <ToolbarButton
        key={index}
        menuItem={menuItem}
        menuActive={activeMenu === index}
        setMenuActive={setActiveMenu}
      />
    );
  });

  return (
    <div className={css.root}>
      <ClickOutside onClick={handleClickOutside}>
        {renderMenuItems}
      </ClickOutside>
    </div>
  );
};

export default ToolbarContainer;
