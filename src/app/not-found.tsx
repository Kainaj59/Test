import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="brand-text text-7xl font-semibold tracking-tight">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-2 max-w-sm text-muted">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="brand-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25"
          >
            <Home size={16} /> Accueil
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:border-brand"
          >
            <ArrowLeft size={16} /> Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
