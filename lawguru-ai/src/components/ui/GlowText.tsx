import { cn } from "@/lib/utils";

interface GlowTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export default function GlowText({
  children,
  className,
  as: Tag = "span",
}: GlowTextProps) {
  return <Tag className={cn("glow-text", className)}>{children}</Tag>;
}
