"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaComments, FaFolderOpen, FaBalanceScale } from "@/components/icons";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/chat", label: "Research", icon: FaComments },
  { href: "/documents", label: "Documents", icon: FaFolderOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="glass-panel px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
            <FaBalanceScale className="w-5 h-5 text-gold" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold text-earth-100 tracking-tight">
              LawGuru<span className="text-gold"> AI</span>
            </span>
            <span className="text-[10px] text-earth-500 font-body tracking-widest uppercase -mt-0.5">
              Zambian Legal Research
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all duration-200",
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-earth-400 hover:text-earth-100 hover:bg-surface-tertiary/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
