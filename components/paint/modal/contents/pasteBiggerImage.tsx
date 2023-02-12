import { PaintFetcher } from "components/contexts/paint";
import { pasteImageProcess } from "components/contexts/paintUtils";
import { FC } from "react";
import css from "./pasteBiggerImage.module.scss";

type Props = {
  image: HTMLImageElement;
};

const PasteBiggerImageModal: FC<Props> = ({ image }) => {
  const paintState = PaintFetcher();
  const { setModalContents } = paintState;

  const handleExpandClick = () => {
    pasteImageProcess(paintState, image);
    setModalContents();
  };

  const handlePasteClick = () => {
    pasteImageProcess(paintState, image);
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
