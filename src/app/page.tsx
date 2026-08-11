"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Phone, Share2, Users, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau branding */}
      <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-black/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <span className="text-lg font-semibold">Nexora AI</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Vos agents IA autonomes qui travaillent 24/7.
          </h1>
          <p className="mt-4 text-white/85">
            Répondez au téléphone, qualifiez vos leads et gérez vos réseaux
            sociaux — sans lever le petit doigt. Économisez jusqu'à 40 heures par
            semaine.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: Phone, text: "Agent téléphonique qui qualifie vos appels" },
              { icon: Users, text: "Qualification et scoring de leads en temps réel" },
              { icon: Share2, text: "Publication et réponses sur vos réseaux" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/80">
          <CheckCircle2 size={16} />
          Plus de 1 200 PME automatisent déjà avec Nexora.
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
          <p className="mt-1 text-sm text-muted">
            Accédez à votre tableau de bord d'agents IA.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/dashboard");
            }}
            className="mt-8 space-y-4"
          >
            <Field label="Email professionnel" type="email" placeholder="vous@entreprise.fr" defaultValue="matt@studionexora.fr" />
            <Field label="Mot de passe" type="password" placeholder="••••••••" defaultValue="demo1234" />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-brand hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="brand-gradient w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/dashboard" className="font-medium text-brand hover:underline">
              Démarrer l'essai gratuit
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted">
            Démo — cliquez sur « Se connecter » pour entrer.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
      />
    </label>
  );
}
