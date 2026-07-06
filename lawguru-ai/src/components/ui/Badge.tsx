import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "copper" | "issue" | "rule" | "application" | "conclusion";
  className?: string;
}

const variantStyles = {
  default: "bg-earth-800/60 text-earth-300 border-earth-700/50",
  gold: "bg-gold/10 text-gold-light border-gold/30",
  copper: "bg-copper/10 text-copper-light border-copper/30",
  issue: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  rule: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  application: "bg-terracotta/10 text-terracotta-light border-terracotta/30",
  conclusion: "bg-zambia-green/10 text-green-400 border-zambia-green/30",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
