"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type NativeSliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export interface SliderProps extends NativeSliderProps {
  value: number[];
  onValueChange?: (value: number[]) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { className, min = 0, max = 100, step = 1, value, onValueChange, disabled, ...props },
  ref
) {
  const numericValue = Array.isArray(value) && value.length > 0 ? value[0] : Number(min);

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={numericValue}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      disabled={disabled}
      className={clsx(
        "h-2 w-full appearance-none rounded-full bg-gray-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
        "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-300",
        className
      )}
      {...props}
    />
  );
});

