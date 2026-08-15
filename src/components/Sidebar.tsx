"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "./Logo";
import { navItems as nav, isActive } from "./nav-items";

const STORAGE_KEY = "nexora.sidebar.collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Restaure l'état depuis le navigateur (après montage, pour éviter un
  // décalage d'hydratation).
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-border bg-surface p-4 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className={collapsed ? "flex justify-center py-2" : "px-2 py-2"}>
        <Link href="/dashboard" aria-label="Nexora AI">
          <Logo compact={collapsed} />
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={2} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
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
      )}

      <Link
        href="/login"
        title={collapsed ? "Déconnexion" : undefined}
        className={`mt-3 flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
      >
        <LogOut size={18} className="shrink-0" />
        {!collapsed && "Déconnexion"}
      </Link>

      <button
        onClick={toggle}
        aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        className={`mt-1 flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
      >
        {collapsed ? (
          <PanelLeftOpen size={18} className="shrink-0" />
        ) : (
          <PanelLeftClose size={18} className="shrink-0" />
        )}
        {!collapsed && "Replier"}
      </button>
    </aside>
  );
}
