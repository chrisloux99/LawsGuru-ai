import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "copper";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-body font-semibold rounded-xl transition-all duration-300 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-surface-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gold text-surface-primary hover:bg-gold-light shadow-glow hover:shadow-glow-lg":
              variant === "primary",
            "bg-surface-tertiary text-earth-200 border border-earth-700 hover:bg-surface-elevated hover:border-copper/40":
              variant === "secondary",
            "text-earth-400 hover:text-earth-100 hover:bg-surface-tertiary/50":
              variant === "ghost",
            "bg-gradient-to-r from-copper to-copper-light text-surface-primary hover:from-copper-light hover:to-copper shadow-copper-glow":
              variant === "copper",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3 text-base tracking-wide": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
