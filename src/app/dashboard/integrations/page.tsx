import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { integrations } from "@/lib/data";
import { Check } from "lucide-react";

export const metadata = { title: "Intégrations" };

export default function IntegrationsPage() {
  const connected = integrations.filter((i) => i.connected).length;

  return (
    <>
      <Topbar
        title="Intégrations"
        subtitle={`${connected} outils connectés · branchez vos agents à votre stack`}
      />

      <div className="p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((i) => (
            <div key={i.id} className="card flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-base font-semibold">
                  {i.name.slice(0, 1)}
                </span>
                <div>
                  <p className="font-semibold leading-tight">{i.name}</p>
                  <p className="text-xs text-muted">{i.category}</p>
                </div>
                {i.connected && (
                  <Badge tone="success" dot>
                    Connecté
                  </Badge>
                )}
              </div>

              <p className="mt-3 flex-1 text-sm text-muted">{i.description}</p>

              <button
                className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  i.connected
                    ? "border border-border bg-surface text-muted hover:text-foreground"
                    : "brand-gradient text-white shadow-lg shadow-brand/25"
                }`}
              >
                {i.connected ? (
                  <>
                    <Check size={16} /> Gérer
                  </>
                ) : (
                  "Connecter"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
