"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaComments, FaFolderOpen } from "@/components/icons";
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
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/ifunde-logo.png"
              alt="iFunde AI Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-earth-100">i</span><span className="text-gold">Funde</span><span className="text-zambia-green text-sm font-semibold ml-1">AI</span>
            </span>
            <span className="text-[10px] text-earth-500 font-body tracking-widest uppercase -mt-0.5 italic">
              Umwengo wa Malango
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
