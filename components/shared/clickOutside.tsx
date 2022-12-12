import { FC, ReactNode, useEffect, useRef, useState } from "react";
import css from "./clickOutside.module.scss";

type Props = {
  children: ReactNode;
  onClick: () => void;
};

const getIsElementInsideTarget = (
  target: HTMLElement,
  search: HTMLElement
): boolean => {
  if (target === search) {
    return true;
  }

  if (target.parentElement) {
    return getIsElementInsideTarget(target.parentNode as HTMLElement, search);
  }

  return false;
};

const ClickOutside: FC<Props> = ({ children, onClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    if (
      e.target &&
      containerRef.current &&
      !getIsElementInsideTarget(e.target as HTMLElement, containerRef.current)
    ) {
      onClick();
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className={css.root} ref={containerRef}>
      {children}
    </div>
  );
};

export default ClickOutside;
