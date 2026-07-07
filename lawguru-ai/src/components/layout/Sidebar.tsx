"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaShieldAlt, FaComments, FaFolderOpen, FaBalanceScale } from "@/components/icons";
import { cn } from "@/lib/utils";

const links = [
  { href: "/chat", label: "Research", icon: FaComments },
  { href: "/documents", label: "Documents", icon: FaFolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 glass-panel cursor-pointer"
        aria-label="Toggle sidebar"
      >
        {open ? (
          <FaTimes className="w-5 h-5 text-earth-300" />
        ) : (
          <FaBars className="w-5 h-5 text-earth-300" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 z-30",
          "flex flex-col pt-24 px-4 transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background:
            "linear-gradient(180deg, #1C1006 0%, #2A1810 100%)",
          borderRight: "1px solid rgba(74,52,25,0.5)",
        }}
      >
        <div className="flex items-center gap-2 px-3 mb-8 lg:hidden">
          <FaBalanceScale className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg font-bold">
            LawGuru<span className="text-gold"> AI</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200",
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
        </nav>

        {/* Zambian-inspired info card */}
        <div className="mt-auto px-3 pb-6">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="w-4 h-4 text-zambia-green" />
              <span className="text-xs font-heading font-semibold text-earth-300">
                Data Sovereignty
              </span>
            </div>
            <p className="text-xs text-earth-500 font-body leading-relaxed">
              All data stays on your machine. Your legal documents never leave
              your control — aligned with Zambia&apos;s data protection
              principles.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
