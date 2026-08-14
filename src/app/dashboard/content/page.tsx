import Link from "next/link";
import { Share2, Mail, FileText } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

const FILTERS = [
  { label: "Tous", value: "" },
  { label: "Posts (Nora)", value: "Nora" },
  { label: "Emails (Max)", value: "Max" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}) {
  const { agent } = await searchParams;
  const active = agent === "Nora" || agent === "Max" ? agent : "";

  const all = await getContent();
  const items = active ? all.filter((c) => c.agent === active) : all;

  return (
    <>
      <Topbar
        title="Contenus"
        subtitle={`${all.length} contenu${all.length > 1 ? "s" : ""} générés par vos agents`}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const on = f.value === active;
            return (
              <Link
                key={f.label}
                href={f.value ? `/dashboard/content?agent=${f.value}` : "/dashboard/content"}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <FileText size={26} className="mb-3 text-brand" />
            <p className="font-medium">Aucun contenu enregistré</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Génère un post avec Nora ou une réponse avec Max, puis clique sur
              « Enregistrer » — il apparaîtra ici.
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/dashboard/agents/nora"
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:text-brand"
              >
                Studio Nora
              </Link>
              <Link
                href="/dashboard/agents/max"
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:text-brand"
              >
                Assistant Max
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((c) => {
              const Icon = c.agent === "Nora" ? Share2 : Mail;
              return (
                <div key={c.id} className="card flex flex-col p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: c.agent === "Nora" ? "var(--brand-2)" : "#f59e0b" }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{c.label}</p>
                      <p className="text-xs text-muted">
                        {c.agent} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge tone="brand">{c.kind === "post" ? "Post" : "Email"}</Badge>
                    </div>
                  </div>
                  <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm leading-relaxed">
                    {c.body}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text={c.body} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
