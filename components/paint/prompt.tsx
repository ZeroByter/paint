import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import DisplayRenderData from "./displayRenderData";
import css from "./notification.module.scss";

const Notification: FC = () => {
  const { promptData, setPromptData } = PaintFetcher();

  if (!promptData) return null;

  const handleButtonClick = (index: number) => {
    return () => {
      promptData.callback(index)
      setPromptData(null)
    }
  }

  const renderButtons = promptData.buttons.map((button, index) => {
    return <button key={index} onClick={handleButtonClick(index)}>{button}</button>
  })

  return (
    <div className={css.root}>
      <div>{promptData.text}</div>
      <div>
        {renderButtons}
      </div>
    </div>
  );
};

export default Notification;
