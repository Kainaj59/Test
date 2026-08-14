"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { navItems, isActive } from "./nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Ferme le tiroir à chaque navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted hover:text-foreground lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Rendu dans <body> via un portail : la Topbar a un backdrop-filter,
          qui piégerait un position:fixed dans son propre contexte. */}
      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside
              className="absolute left-0 top-0 z-10 flex h-full w-72 flex-col border-r border-border p-4 shadow-2xl"
              style={{ background: "var(--surface)" }}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-6 flex-1 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
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

              <Link
                href="/"
                className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <LogOut size={18} />
                Déconnexion
              </Link>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
