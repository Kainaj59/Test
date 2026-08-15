"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center p-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-danger/12 text-danger">
          <AlertTriangle size={22} />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-muted">
          Cette page n'a pas pu se charger. Réessayez — si le problème persiste,
          revenez au tableau de bord.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="brand-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:border-brand"
          >
            <Home size={16} /> Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
