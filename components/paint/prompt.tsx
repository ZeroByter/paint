import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import css from "./prompt.module.scss";

const Prompt: FC = () => {
  const { promptData, setPromptData } = PaintFetcher();

  if (!promptData) return null;

  const handleButtonClick = (index: number) => {
    return () => {
      promptData.callback(index);
      setPromptData(null);
    };
  };

  const renderButtons = promptData.buttons.map((button, index) => {
    return (
      <button key={index} onClick={handleButtonClick(index)}>
        {button}
      </button>
    );
  });

  return (
    <div className={css.root}>
      <div className={css.container}>
        <div>{promptData.text}</div>
        <div className={css.buttons}>{renderButtons}</div>
      </div>
    </div>
  );
};

export default Prompt;
