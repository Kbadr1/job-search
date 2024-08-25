import { RefObject, useEffect } from "react";

export function useClickOutside(
  ref: RefObject<HTMLDivElement>,
  handleClickOutside: () => void
) {
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref?.current?.contains(event.target as Node)) {
        handleClickOutside();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [ref]);
}