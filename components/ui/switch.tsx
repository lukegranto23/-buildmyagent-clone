"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, className, disabled, id, ...props },
  ref
) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={clsx(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-blue-500" : "bg-gray-300",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
      id={id}
      {...props}
    >
      <span
        className={clsx(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
      <input ref={ref} id={id} type="checkbox" className="sr-only" checked={checked} readOnly />
    </button>
  );
});

