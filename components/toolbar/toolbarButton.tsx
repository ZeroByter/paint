import { FC } from "react";
import css from "./toolbarButton.module.scss";
import { MenuItem } from "./toolbarContainer";

type Props = {
  index: number;
  menuItem: MenuItem;
  menuActive: boolean;
  setMenuActive: (newActiveMenu: number) => void;
};

const ToolbarButton: FC<Props> = ({
  index,
  menuItem,
  menuActive,
  setMenuActive,
}) => {
  const renderSubItems = menuItem.subItems.map((subItem, index) => {
    return (
      <button key={index} onClick={subItem.onClick}>
        {subItem.text}
      </button>
    );
  });

  return (
    <div className={css.root}>
      <button onClick={() => setMenuActive(index)}>{menuItem.text}</button>
      {menuActive && (
        <div className={css.menuContainer} onClick={() => setMenuActive(-1)}>
          {renderSubItems}
        </div>
      )}
    </div>
  );
};

export default ToolbarButton;
