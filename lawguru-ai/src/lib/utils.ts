import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function parseIRACSections(text: string): {
  issue: string;
  rule: string;
  application: string;
  conclusion: string;
} {
  const sections = { issue: "", rule: "", application: "", conclusion: "" };

  const issueMatch = text.match(
    /##\s*Issue\s*\n([\s\S]*?)(?=##\s*Rule|$)/i
  );
  const ruleMatch = text.match(
    /##\s*Rule\s*\n([\s\S]*?)(?=##\s*Application|$)/i
  );
  const applicationMatch = text.match(
    /##\s*Application\s*\n([\s\S]*?)(?=##\s*Conclusion|$)/i
  );
  const conclusionMatch = text.match(/##\s*Conclusion\s*\n([\s\S]*?)$/i);

  if (issueMatch) sections.issue = issueMatch[1].trim();
  if (ruleMatch) sections.rule = ruleMatch[1].trim();
  if (applicationMatch) sections.application = applicationMatch[1].trim();
  if (conclusionMatch) sections.conclusion = conclusionMatch[1].trim();

  return sections;
}
