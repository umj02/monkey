import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AppInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-14 w-full rounded-[18px] border border-monkey-line bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-monkey-green focus:ring-4 focus:ring-green-100",
        className
      )}
    />
  );
}
