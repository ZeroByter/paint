import { useCallback, useEffect } from "react";

const useDocumentEvent = (event: keyof DocumentEventMap, callback: any) => {
  useEffect(() => {
    document.addEventListener(event, callback);

    return () => {
      document.removeEventListener(event, callback);
    };
  }, [event, callback]);
};

export default useDocumentEvent;
