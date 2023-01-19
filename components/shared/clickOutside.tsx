import { FC, ReactNode, useEffect, useRef, useState } from "react";
import css from "./clickOutside.module.scss";
import classNames from "classnames";

type Props = {
  children: ReactNode;
  className?: string;
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

const ClickOutside: FC<Props> = ({ children, className, onClick }) => {
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
    <div className={classNames(css.root, className)} ref={containerRef}>
      {children}
    </div>
  );
};

export default ClickOutside;
