"use client";

import ReactMarkdown from "react-markdown";
import Badge from "@/components/ui/Badge";
import { FaUsers, FaLandmark, FaBook, FaGavel } from "@/components/icons";
import type { IRACResponse } from "@/types";

interface Props {
  irac: IRACResponse;
}

const sections = [
  {
    key: "issue" as const,
    label: "Issue",
    icon: FaGavel,
    variant: "issue" as const,
    color: "border-yellow-500/20 bg-yellow-500/5",
    dot: "bg-yellow-500",
    iconColor: "text-yellow-400",
  },
  {
    key: "rule" as const,
    label: "Rule",
    icon: FaBook,
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
            <div className="font-body text-sm leading-relaxed text-earth-200">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1 text-earth-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1 text-earth-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-earth-100">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-earth-300">{children}</em>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-surface-tertiary text-copper text-xs font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block p-3 rounded-lg bg-surface-tertiary text-earth-200 text-xs font-mono overflow-x-auto mb-2">
                        {children}
                      </code>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
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
