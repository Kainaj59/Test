"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";

export function SaveContentButton({
  agent,
  kind,
  label,
  body,
  disabled,
}: {
  agent: "Nora" | "Max";
  kind: "post" | "email";
  label: string;
  body: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    if (disabled || state === "saving" || !body.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, kind, label, body }),
      });
      setState(res.ok ? "saved" : "idle");
      if (res.ok) setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      onClick={save}
      disabled={disabled || state === "saving"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
    >
      {state === "saved" ? <Check size={13} /> : <Save size={13} />}
      {state === "saved" ? "Enregistré" : state === "saving" ? "…" : "Enregistrer"}
    </button>
  );
}
