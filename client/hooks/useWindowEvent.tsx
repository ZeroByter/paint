import { useCallback, useEffect } from "react";

const useWindowEvent = (event: keyof WindowEventMap, callback: any) => {
  useEffect(() => {
    window.addEventListener(event, callback);

    return () => {
      window.removeEventListener(event, callback);
    };
  }, [event, callback]);
};

export default useWindowEvent;
