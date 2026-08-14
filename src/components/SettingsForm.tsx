"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Settings } from "@/lib/store";

const TOGGLES: { key: keyof Settings; label: string; desc: string }[] = [
  {
    key: "autoTransfer",
    label: "Transfert d'appel automatique",
    desc: "Les appels urgents sont transférés à votre équipe.",
  },
  {
    key: "validateBeforePublish",
    label: "Validation avant publication",
    desc: "Les posts réseaux sociaux attendent votre feu vert.",
  },
  {
    key: "dailySummary",
    label: "Résumé quotidien par email",
    desc: "Recevez chaque matin un récap de l'activité.",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    if (state === "saving") return;
    setState("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(res.ok ? "saved" : "idle");
      if (res.ok) setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("idle");
    }
  }

  return (
    <>
      {/* Profil */}
      <section className="card p-6">
        <h2 className="font-semibold">Profil</h2>
        <p className="text-sm text-muted">
          Ces informations sont utilisées par vos agents pour se présenter.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <div className="brand-gradient grid h-16 w-16 place-items-center rounded-full text-lg font-semibold text-white">
            {initials(form.fullName) || "N"}
          </div>
          <button
            type="button"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            Changer la photo
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" value={form.fullName} onChange={(v) => set("fullName", v)} />
          <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
          <Field label="Entreprise" value={form.company} onChange={(v) => set("company", v)} />
          <Field label="Téléphone" value={form.phone} onChange={(v) => set("phone", v)} />
        </div>
      </section>

      {/* Préférences agents */}
      <section className="card p-6">
        <h2 className="font-semibold">Préférences des agents</h2>
        <div className="mt-4 divide-y divide-border">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-sm text-muted">{t.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form[t.key] as boolean}
                onClick={() => set(t.key, !form[t.key] as Settings[typeof t.key])}
                className={`ml-auto relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form[t.key] ? "bg-brand" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    form[t.key] ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Barre d'enregistrement */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="brand-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 disabled:opacity-60"
        >
          {state === "saved" && <Check size={16} />}
          {state === "saving" ? "Enregistrement…" : state === "saved" ? "Enregistré" : "Enregistrer les modifications"}
        </button>
        {state === "saved" && (
          <span className="text-sm text-success">Vos réglages ont été sauvegardés.</span>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
