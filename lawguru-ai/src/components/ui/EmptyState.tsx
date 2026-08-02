import type { SVGProps } from "react";
import Button from "./Button";

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

interface EmptyStateProps {
  icon?: IconComponent;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-xl bg-earth-800/60 border border-earth-700/50 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-earth-600" />
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-earth-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-earth-500 font-body max-w-sm mx-auto mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button variant="copper" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
