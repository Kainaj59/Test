"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { navItems as nav, isActive } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
      <div className="px-2 py-2">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="brand-gradient relative mt-4 overflow-hidden rounded-2xl p-4 text-white">
        <Sparkles size={18} className="mb-2" />
        <p className="text-sm font-semibold">Passez au plan Pro</p>
        <p className="mt-1 text-xs text-white/80">
          Débloquez les 11 agents et les appels illimités.
        </p>
        <button className="mt-3 w-full rounded-lg bg-white/95 py-1.5 text-xs font-semibold text-brand hover:bg-white">
          Mettre à niveau
        </button>
      </div>

      <Link
        href="/"
        className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <LogOut size={18} />
        Déconnexion
      </Link>
    </aside>
  );
}
