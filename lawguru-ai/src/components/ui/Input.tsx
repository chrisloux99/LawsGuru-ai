import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3",
          "text-slate-100 placeholder:text-slate-500 font-body text-sm",
          "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
