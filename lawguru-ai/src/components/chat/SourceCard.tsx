"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaFileAlt } from "react-icons/fa";
import Badge from "@/components/ui/Badge";

interface Props {
  fileName: string;
  score: number;
  chunkIndex: number;
  text?: string;
}

export default function SourceCard({
  fileName,
  score,
  chunkIndex,
  text,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel p-3 text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <FaFileAlt className="w-3.5 h-3.5 text-earth-500" />
          <span className="text-xs font-body text-earth-300 truncate max-w-[200px]">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold">{(score * 100).toFixed(1)}%</Badge>
          {expanded ? (
            <FaChevronUp className="w-3.5 h-3.5 text-earth-500" />
          ) : (
            <FaChevronDown className="w-3.5 h-3.5 text-earth-500" />
          )}
        </div>
      </button>

      {expanded && text && (
        <div className="mt-3 pt-3 border-t border-earth-800">
          <p className="text-xs text-earth-400 font-body leading-relaxed line-clamp-6">
            {text}
          </p>
          <p className="text-xs text-earth-600 mt-2">
            Chunk #{chunkIndex + 1}
          </p>
        </div>
      )}
    </div>
  );
}
