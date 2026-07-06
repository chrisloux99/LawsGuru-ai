import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  copper?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow, copper, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel p-6 transition-all duration-300",
          glow && "glow-border hover:shadow-glow",
          copper && "copper-glow hover:shadow-copper-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
