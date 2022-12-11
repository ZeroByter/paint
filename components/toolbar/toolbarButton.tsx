import { FC } from "react";
import css from "./toolbarButton.module.scss";

type Props = {
  text: string;
  menuActive: boolean;
  setMenuActive: (newActiveMenu: number) => void;
};

const ToolbarButton: FC<Props> = ({ text, menuActive, setMenuActive }) => {
  return (
    <div className={css.root}>
      <button onClick={() => setMenuActive(0)}>{text}</button>
      {menuActive && (
        <div className={css.menuContainer}>
          <button>meme</button>
        </div>
      )}
    </div>
  );
};

export default ToolbarButton;
