import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawGuru AI — Zambian Legal Research, Decoded",
  description:
    "AI-powered legal research for the Zambian justice system using the IRAC framework. Analyze statutes, case law, and constitutional matters. Local, private, and fast.",
  keywords: [
    "Zambian law",
    "legal research",
    "IRAC",
    "Zambia",
    "case law",
    "statutes",
    "legal AI",
    "Lusaka",
    "Supreme Court of Zambia",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
