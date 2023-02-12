import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import css from "./pasteBiggerImage.module.scss";

const PasteBiggerImageModal: FC = () => {
  const { setModalContents } = PaintFetcher();

  const handleExpandClick = () => {
    setModalContents();
  };

  const handlePasteClick = () => {
    setModalContents();
  };

  const handleAbortClick = () => {
    setModalContents();
  };

  return (
    <div className={css.root}>
      <div>this image is too thick</div>
      <div className={css.buttons}>
        <button onClick={handleExpandClick}>expand image</button>
        <button onClick={handlePasteClick}>only paste</button>
        <button onClick={handleAbortClick}>abort</button>
      </div>
    </div>
  );
};

export default PasteBiggerImageModal;
