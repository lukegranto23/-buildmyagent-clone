"use client";

import { forwardRef, type LabelHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={clsx("text-sm font-medium text-gray-700", className)}
      {...props}
    />
  );
});

