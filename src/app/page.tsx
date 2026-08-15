import Link from "next/link";
import {
  Phone,
  Share2,
  MessageCircle,
  Mail,
  Smartphone,
  Check,
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { agents } from "@/lib/data";

const channelIcon: Record<string, LucideIcon> = {
  Téléphone: Phone,
  "Réseaux sociaux": Share2,
  Chat: MessageCircle,
  Email: Mail,
  SMS: Smartphone,
};

const STEPS = [
  {
    n: "1",
    title: "Connectez vos outils",
    text: "Reliez votre téléphonie, vos réseaux, votre boîte mail et votre agenda en quelques clics.",
  },
  {
    n: "2",
    title: "Activez vos agents",
    text: "Choisissez les agents IA dont vous avez besoin et définissez vos règles métier.",
  },
  {
    n: "3",
    title: "Ils travaillent 24/7",
    text: "Vos agents qualifient, répondent, publient et prennent des rendez-vous — même la nuit.",
  },
];

const PLANS = [
  {
    name: "Essentiel",
    price: "69,90 €",
    period: "/ mois",
    tagline: "Pour démarrer l'automatisation.",
    features: [
      "5 agents IA",
      "Qualification & scoring de leads",
      "Générateur de contenu & emails",
      "Jusqu'à 500 actions / mois",
      "Intégrations de base",
    ],
    cta: "Démarrer l'essai",
    highlight: false,
  },
  {
    name: "Pro",
    price: "149 €",
    period: "/ mois",
    tagline: "Pour passer à l'échelle.",
    features: [
      "11 agents IA",
      "Appels & messages illimités",
      "Tous les canaux (tél, réseaux, email, SMS)",
      "Intégrations avancées (HubSpot, CRM…)",
      "Support prioritaire",
    ],
    cta: "Démarrer l'essai",
    highlight: true,
  },
  {
    name: "Sur-mesure",
    price: "Sur devis",
    period: "",
    tagline: "Pour les équipes exigeantes.",
    features: [
      "Volume illimité",
      "Agents personnalisés",
      "Onboarding dédié",
      "SLA & sécurité renforcée",
      "Accompagnement humain",
    ],
    cta: "Nous contacter",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
          <div className="shrink-0">
            <Logo />
          </div>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#agents" className="hover:text-foreground">Agents</a>
            <a href="#fonctionnement" className="hover:text-foreground">Fonctionnement</a>
            <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-foreground sm:px-4"
            >
              Connexion
            </Link>
            <Link
              href="/dashboard"
              className="brand-gradient whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25 sm:px-4"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="brand-gradient absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-5 py-20 text-center lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles size={13} className="text-brand" />
            Agents IA autonomes pour PME
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
            Vos agents IA qui travaillent
            <span className="brand-text"> 24/7</span> à votre place.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Nexora déploie des agents IA qui répondent au téléphone, qualifient
            vos leads, gèrent vos réseaux et rédigent vos emails. Jusqu'à
            <span className="text-foreground"> 40 heures économisées</span> par semaine.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="brand-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
            >
              Démarrer gratuitement <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard/agents/sofia"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold hover:border-brand"
            >
              Tester un agent en direct
            </Link>
          </div>

          {/* Bandeau de stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Clock, value: "40 h", label: "économisées / sem." },
              { icon: Users, value: "1 200+", label: "PME clientes" },
              { icon: Phone, value: "24/7", label: "disponibilité" },
              { icon: ShieldCheck, value: "99,9 %", label: "fiabilité" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="card p-4">
                <Icon size={18} className="mx-auto text-brand" />
                <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            Une équipe d'agents IA, à votre service
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Chacun est spécialisé, travaille en autonomie et vous transmet
            l'essentiel.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const Icon = channelIcon[agent.channel] ?? MessageCircle;
            return (
              <div key={agent.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ background: agent.accent }}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{agent.name}</p>
                    <p className="text-sm text-muted">{agent.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{agent.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Opérationnel en moins de 10 minutes
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-6">
                <span className="brand-gradient grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold text-white">
                  {s.n}
                </span>
                <p className="mt-4 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
            <span>S'intègre avec</span>
            {["HubSpot", "Gmail", "Google Calendar", "Instagram", "LinkedIn", "Slack"].map(
              (name) => (
                <span key={name} className="font-medium text-foreground">
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            Des tarifs simples
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Sans engagement. Essai gratuit, aucune carte requise.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card relative flex flex-col p-6 ${
                plan.highlight ? "border-brand ring-1 ring-brand" : ""
              }`}
            >
              {plan.highlight && (
                <span className="brand-gradient absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  Le plus populaire
                </span>
              )}
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                <span className="pb-1 text-sm text-muted">{plan.period}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={`mt-6 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "brand-gradient text-white shadow-lg shadow-brand/25"
                    : "border border-border bg-surface hover:border-brand"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Questions fréquentes
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              {
                q: "Combien de temps pour être opérationnel ?",
                a: "Moins de 10 minutes : vous connectez vos outils, activez les agents dont vous avez besoin et définissez vos règles. Aucune compétence technique requise.",
              },
              {
                q: "Puis-je essayer gratuitement ?",
                a: "Oui. L'essai est gratuit et sans carte bancaire. Vous ne payez que si vous décidez de continuer.",
              },
              {
                q: "Mes données sont-elles en sécurité ?",
                a: "Vos données restent les vôtres. Les échanges sont chiffrés et vous gardez le contrôle des accès de chaque agent à tout moment.",
              },
              {
                q: "Avec quels outils Nexora s'intègre-t-il ?",
                a: "HubSpot, Gmail, Google Calendar, Instagram, LinkedIn, Slack et d'autres. De nouvelles intégrations sont ajoutées régulièrement.",
              },
              {
                q: "Puis-je garder la main sur ce que font les agents ?",
                a: "Bien sûr. Chaque agent peut demander votre validation avant d'agir (par exemple avant de publier un post), et vous suivez toute leur activité depuis le tableau de bord.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="card group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {q}
                  <span className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="brand-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white">
          <div
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <h2 className="relative text-3xl font-semibold tracking-tight">
            Prêt à déléguer à vos agents IA ?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            Rejoignez les PME qui économisent des dizaines d'heures chaque
            semaine avec Nexora.
          </p>
          <Link
            href="/dashboard"
            className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
          >
            Démarrer gratuitement <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Nexora AI — Démo produit.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Connexion</Link>
            <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
