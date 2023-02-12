import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import css from "./index.module.scss";

const ModalContainer: FC = () => {
  const { modalContents } = PaintFetcher();

  if (modalContents == null) return null;

  return (
    <div className={css.root}>
      <div className={css.container}>{modalContents}</div>
    </div>
  );
};

export default ModalContainer;
