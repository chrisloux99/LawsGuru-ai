"use client";

import Badge from "@/components/ui/Badge";
import { FaUsers, FaLandmark, FaBookOpen } from "react-icons/fa6";
import { GiGavel } from "react-icons/gi";
import type { IRACResponse } from "@/types";

interface Props {
  irac: IRACResponse;
}

const sections = [
  {
    key: "issue" as const,
    label: "Issue",
    icon: GiGavel,
    variant: "issue" as const,
    color: "border-yellow-500/20 bg-yellow-500/5",
    dot: "bg-yellow-500",
    iconColor: "text-yellow-400",
  },
  {
    key: "rule" as const,
    label: "Rule",
    icon: FaBookOpen,
    variant: "rule" as const,
    color: "border-blue-500/20 bg-blue-500/5",
    dot: "bg-blue-500",
    iconColor: "text-blue-400",
  },
  {
    key: "application" as const,
    label: "Application",
    icon: FaUsers,
    variant: "application" as const,
    color: "border-terracotta/20 bg-terracotta/5",
    dot: "bg-terracotta",
    iconColor: "text-terracotta",
  },
  {
    key: "conclusion" as const,
    label: "Conclusion",
    icon: FaLandmark,
    variant: "conclusion" as const,
    color: "border-zambia-green/20 bg-zambia-green/5",
    dot: "bg-zambia-green",
    iconColor: "text-green-400",
  },
];

export default function IRACBlock({ irac }: Props) {
  return (
    <div className="space-y-4 text-left">
      {sections.map(({ key, label, icon: Icon, variant, color, dot, iconColor }) => {
        const content = irac[key];
        if (!content) return null;

        return (
          <div
            key={key}
            className={`rounded-xl border p-4 ${color} transition-all duration-200`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <Badge variant={variant}>{label}</Badge>
            </div>
            <div className="font-body text-sm leading-relaxed text-earth-200 whitespace-pre-wrap">
              {content}
            </div>
          </div>
        );
      })}

      {irac.sources.length > 0 && (
        <div className="pt-3 border-t border-earth-800/50">
          <p className="text-xs text-earth-500 mb-2 font-body">Sources cited:</p>
          <div className="flex flex-wrap gap-2">
            {irac.sources.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface-tertiary/50 text-earth-400 border border-earth-800/50"
              >
                {s.chunk.metadata.fileName} ({(s.score * 100).toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
