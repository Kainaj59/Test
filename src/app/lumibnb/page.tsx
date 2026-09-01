import Link from "next/link";
import {
  Camera,
  Sparkles,
  Clapperboard,
  Wand2,
  ArrowRight,
  Check,
  Star,
  Upload,
  Download,
  type LucideIcon,
} from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: "Analyse IA de vos photos",
    text: "Une IA entraînée au regard des voyageurs note chaque photo (lumière, cadrage, attrait), vous dit quoi reprendre et rédige même la légende de l'annonce.",
  },
  {
    icon: Wand2,
    title: "Retouche en un clic",
    text: "Presets calibrés pour l'intérieur (Lumineux, Chaleureux, Éclatant…) ou réglages fins — appliquez les réglages suggérés par l'IA et téléchargez la photo prête à publier.",
  },
  {
    icon: Clapperboard,
    title: "Vidéo à partir de vos photos",
    text: "Transformez 3 à 10 photos en vidéo animée (effet Ken Burns, fondus, titre) au format Reels/TikTok ou paysage — générée dans votre navigateur, sans upload.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Déposez vos photos",
    text: "Glissez les photos actuelles de votre annonce dans le studio — elles restent sur votre appareil.",
  },
  {
    n: "2",
    title: "Améliorez",
    text: "L'IA note chaque photo et propose des réglages ; appliquez-les ou choisissez un preset, puis téléchargez.",
  },
  {
    n: "3",
    title: "Publiez & réservez",
    text: "Remplacez les photos de l'annonce et partagez la vidéo sur Instagram et TikTok pour attirer les voyageurs.",
  },
];

const PLANS = [
  {
    name: "Découverte",
    price: "0 €",
    period: "",
    tagline: "Pour tester sur votre annonce.",
    features: [
      "Retouche photo illimitée",
      "3 analyses IA / mois",
      "Vidéo en 720p",
      "1 annonce",
    ],
    cta: "Essayer gratuitement",
    highlight: false,
  },
  {
    name: "Hôte",
    price: "14,90 €",
    period: "/ mois",
    tagline: "Pour remplir votre calendrier.",
    features: [
      "Analyses IA illimitées",
      "Légendes d'annonce générées",
      "Vidéos verticales & paysage",
      "Jusqu'à 3 annonces",
      "Support par email",
    ],
    cta: "Démarrer l'essai",
    highlight: true,
  },
  {
    name: "Conciergerie",
    price: "49 €",
    period: "/ mois",
    tagline: "Pour gérer un parc d'annonces.",
    features: [
      "Annonces illimitées",
      "Traitement par lot",
      "Marque blanche sur les vidéos",
      "Accès multi-utilisateurs",
      "Support prioritaire",
    ],
    cta: "Nous contacter",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "Mes photos sont-elles envoyées sur vos serveurs ?",
    a: "La retouche et la génération de vidéo se font entièrement dans votre navigateur : vos photos ne quittent pas votre appareil. Seule l'analyse IA envoie un aperçu compressé de la photo, le temps de l'évaluer.",
  },
  {
    q: "Ai-je besoin de matériel professionnel ?",
    a: "Non. Les conseils de l'IA sont pensés pour un smartphone : heure de prise de vue, rangement, angle, hauteur, lumières. La retouche fait le reste.",
  },
  {
    q: "Dans quels formats la vidéo est-elle générée ?",
    a: "Vertical 9:16 (Reels, TikTok, Stories), paysage 16:9 (site, YouTube) ou carré 1:1 (Instagram). La vidéo se télécharge en WebM, lisible partout et importable dans les apps de publication.",
  },
  {
    q: "Est-ce que ça marche aussi pour Booking, Abritel… ?",
    a: "Oui. De belles photos et une vidéo attractive fonctionnent sur toutes les plateformes de location courte durée — et sur vos réseaux sociaux.",
  },
];

function LumibnbLogo() {
  return (
    <Link href="/lumibnb" className="flex items-center gap-2.5">
      <span className="brand-gradient flex size-9 items-center justify-center rounded-xl text-white shadow-lg shadow-brand/25">
        <Camera size={18} />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Lumi<span className="brand-text">bnb</span>
      </span>
    </Link>
  );
}

export default function LumibnbLandingPage() {
  return (
    <div className="min-h-screen">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
          <div className="shrink-0">
            <LumibnbLogo />
          </div>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalités</a>
            <a href="#fonctionnement" className="hover:text-foreground">Fonctionnement</a>
            <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="ml-auto">
            <Link
              href="/lumibnb/studio"
              className="brand-gradient whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25 sm:px-4"
            >
              Ouvrir le studio
            </Link>
          </div>
        </div>
      </header>

      {/* Héros */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 text-center sm:pt-24">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <Star size={13} className="text-warning" />
          Pensé pour les hôtes Airbnb, Booking & co
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Des photos qui font <span className="brand-text">réserver</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
          Sur Airbnb, la photo décide en 3 secondes. Lumibnb analyse vos photos
          avec l&apos;IA, les retouche en un clic et les transforme en vidéo
          prête pour Instagram et TikTok — sans photographe, sans logiciel à
          installer.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/lumibnb/studio"
            className="brand-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
          >
            Améliorer mes photos <ArrowRight size={16} />
          </Link>
          <a
            href="#fonctionnement"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold hover:bg-surface-2"
          >
            Voir comment ça marche
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Gratuit pour commencer · vos photos restent sur votre appareil
        </p>
      </section>

      {/* Problème → solution */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            { stat: "3 s", text: "C'est le temps qu'un voyageur passe sur votre annonce avant de swiper — la photo de couverture fait tout." },
            { stat: "+40 %", text: "de clics constatés sur les annonces aux photos lumineuses et bien cadrées par rapport aux photos sombres." },
            { stat: "0 €", text: "de photographe : votre smartphone suffit quand l'IA vous dit quoi reprendre et que la retouche fait le reste." },
          ].map((item) => (
            <div key={item.stat} className="text-center sm:text-left">
              <p className="brand-text text-4xl font-bold">{item.stat}</p>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Trois outils, un objectif : <span className="brand-text">plus de réservations</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted">
          Tout se passe dans le studio, directement dans votre navigateur.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="brand-gradient mb-4 flex size-11 items-center justify-center rounded-xl text-white shadow-lg shadow-brand/25">
                <f.icon size={20} />
              </span>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            De vos photos au calendrier plein
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card relative p-6">
                <span className="brand-gradient absolute -top-4 left-6 flex size-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg shadow-brand/25">
                  {s.n}
                </span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted">
            <Upload size={16} className="text-brand" /> Déposez
            <ArrowRight size={14} />
            <Sparkles size={16} className="text-brand" /> Améliorez
            <ArrowRight size={14} />
            <Download size={16} className="text-brand" /> Publiez
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">Tarifs simples</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted">
          Une nuitée gagnée rembourse l&apos;abonnement de l&apos;année.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card relative flex flex-col p-6 ${
                plan.highlight ? "border-brand shadow-lg shadow-brand/10" : ""
              }`}
            >
              {plan.highlight && (
                <span className="brand-gradient absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  Populaire
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted">{plan.tagline}</p>
              <p className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/lumibnb/studio"
                className={`mt-6 rounded-xl py-2.5 text-center text-sm font-semibold ${
                  plan.highlight
                    ? "brand-gradient text-white shadow-lg shadow-brand/25"
                    : "border border-border bg-surface hover:bg-surface-2"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                  {item.q}
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action final */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="card brand-gradient p-10 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Votre annonce mérite mieux que des photos sombres
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
            Déposez vos photos dans le studio et voyez la différence en deux
            minutes — gratuitement.
          </p>
          <Link
            href="/lumibnb/studio"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand shadow-lg"
          >
            Ouvrir le studio <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <LumibnbLogo />
          <p>© {new Date().getFullYear()} Lumibnb — un projet du lab Nexora.</p>
        </div>
      </footer>
    </div>
  );
}
