import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Réglages" subtitle="Compte, entreprise et facturation" />

      <div className="space-y-6 p-5 lg:p-8">
        {/* Profil */}
        <section className="card p-6">
          <h2 className="font-semibold">Profil</h2>
          <p className="text-sm text-muted">
            Ces informations sont utilisées par vos agents pour se présenter.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="brand-gradient grid h-16 w-16 place-items-center rounded-full text-lg font-semibold text-white">
              MJ
            </div>
            <button className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium">
              Changer la photo
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet" defaultValue="Matt Janiak" />
            <Field label="Email" defaultValue="matt@studionexora.fr" />
            <Field label="Entreprise" defaultValue="Studio Nexora" />
            <Field label="Téléphone" defaultValue="+33 6 12 34 56 78" />
          </div>
        </section>

        {/* Préférences agents */}
        <section className="card p-6">
          <h2 className="font-semibold">Préférences des agents</h2>
          <div className="mt-4 divide-y divide-border">
            <ToggleRow
              label="Transfert d'appel automatique"
              desc="Les appels urgents sont transférés à votre équipe."
              on
            />
            <ToggleRow
              label="Validation avant publication"
              desc="Les posts réseaux sociaux attendent votre feu vert."
            />
            <ToggleRow
              label="Résumé quotidien par email"
              desc="Recevez chaque matin un récap de l'activité."
              on
            />
          </div>
        </section>

        {/* Plan */}
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

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </label>
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

function ToggleRow({
  label,
  desc,
  on = false,
}: {
  label: string;
  desc: string;
  on?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <span
        className={`ml-auto relative h-6 w-11 shrink-0 rounded-full ${
          on ? "bg-brand" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}
