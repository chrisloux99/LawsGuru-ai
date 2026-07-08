import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

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
    <html lang="en" className={`dark ${outfit.variable} ${workSans.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#2A1810",
              border: "1px solid rgba(74,52,25,0.5)",
              color: "#F5E6D3",
              fontFamily: "var(--font-work-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
