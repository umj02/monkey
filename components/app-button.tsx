import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AppButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-14 w-full rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95",
        className
      )}
    >
      {children}
    </button>
  );
}
