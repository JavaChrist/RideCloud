"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, containerClassName, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "group relative inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center",
          disabled && "cursor-not-allowed opacity-50",
          containerClassName
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          disabled={disabled}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200",
            "group-hover:border-slate-400",
            "group-has-[:checked]:border-blue-600 group-has-[:checked]:bg-blue-600 group-has-[:checked]:shadow-[0_4px_12px_-4px_rgba(29,78,216,0.5)]",
            "group-has-[:checked]:group-hover:bg-blue-700",
            "group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-blue-500 group-has-[:focus-visible]:ring-offset-2",
            className
          )}
        >
          <Check
            className="h-3.5 w-3.5 scale-0 stroke-[3] text-white transition-transform duration-200 group-has-[:checked]:scale-100"
            aria-hidden
          />
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
