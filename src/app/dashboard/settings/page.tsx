import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { SettingsForm } from "@/components/SettingsForm";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <Topbar title="Réglages" subtitle="Compte, entreprise et facturation" />

      <div className="space-y-6 p-5 lg:p-8">
        <SettingsForm initial={settings} />

        {/* Plan (démo, lecture seule) */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Abonnement</h2>
              <p className="text-sm text-muted">Votre plan actuel et vos limites.</p>
            </div>
            <Badge tone="brand">Plan Essentiel</Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Meta label="Prix" value="69,90 € / mois" />
            <Meta label="Agents inclus" value="5 / 11" />
            <Meta label="Appels ce mois" value="342 / 500" />
          </div>
          <button className="brand-gradient mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25">
            Passer au plan Pro
          </button>
        </section>
      </div>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
