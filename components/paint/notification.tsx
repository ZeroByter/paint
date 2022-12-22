import { PaintFetcher } from "components/contexts/paint";
import { FC } from "react";
import DisplayRenderData from "./displayRenderData";
import css from "./notification.module.scss";

const Notification: FC = () => {
  const { notificationData } = PaintFetcher();

  if (!notificationData) return null;

  return (
    <div key={notificationData.id} className={css.root}>
      {notificationData.text}
      {notificationData.image && (
        <DisplayRenderData
          className={css.image}
          imageData={notificationData.image}
        />
      )}
    </div>
  );
};

export default Notification;
