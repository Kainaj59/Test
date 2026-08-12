# Nexora AI

Tableau de bord SaaS (MVP) pour une plateforme d'**agents IA autonomes** destinés aux PME —
inspiré de produits comme Limova.AI, mais avec une marque et un code entièrement originaux.

Les agents répondent au téléphone, qualifient les leads, gèrent les réseaux sociaux,
trient les emails et prennent des rendez-vous, 24/7.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** pour les icônes
- **@anthropic-ai/sdk** — l'agent Sofia est réellement branché à l'API Claude
- Graphiques SVG maison (aucune dépendance de charting)

## Agent IA fonctionnel — Sofia (qualification de leads)

Sofia n'est pas une maquette : c'est un **vrai agent IA branché à l'API Claude**.
Ouvre **Agents IA → Sofia → « Tester en direct »** (`/dashboard/agents/sofia`) et
discute avec elle comme un prospect. Elle mène la conversation, puis **score et
qualifie le lead automatiquement** (sortie structurée via *tool use*) dans le
panneau de droite.

- Endpoint : `src/app/api/qualify/route.ts` (Route Handler, modèle `claude-opus-5`)
- Prompt & schéma de qualification : `src/lib/sofia.ts`
- Interface de chat : `src/app/dashboard/agents/sofia/page.tsx`

### Configuration de la clé API

Sofia a besoin d'une clé API Claude au runtime :

```bash
cp .env.example .env.local
# puis renseigne ANTHROPIC_API_KEY dans .env.local
```

Sans clé, l'interface fonctionne toujours mais Sofia affiche un message
invitant à configurer `ANTHROPIC_API_KEY` (aucun crash).

### La boucle est fermée : chat → lead persistant → page Leads

Quand Sofia qualifie un prospect, le lead est **enregistré** puis **remonte
automatiquement dans la page Leads** (badge « IA », source « Agent Sofia »,
score et pipeline mis à jour).

- Couche de données : `src/lib/store.ts` (interface `getLeads()` / `addLead()`)
- Persistance actuelle : fichier JSON local `.data/leads.json` — fonctionne en
  `npm run dev` et sur un hébergement Node persistant. Sur un runtime serverless
  au disque éphémère, l'écriture retombe sur un cache mémoire.
- **Passer à une vraie base** (Supabase/Postgres) = réimplémenter les deux
  fonctions de `store.ts`, rien d'autre à changer dans l'app.

## Pages

| Route | Description |
| --- | --- |
| `/` | Écran de connexion (démo — cliquez sur « Se connecter ») |
| `/dashboard` | Vue d'ensemble : KPIs, courbe d'activité, répartition par canal, flux d'activité |
| `/dashboard/agents` | Gestion des agents IA (activer / mettre en pause) |
| `/dashboard/leads` | Table des leads avec scoring et pipeline |
| `/dashboard/conversations` | Boîte de réception unifiée multi-canal |
| `/dashboard/integrations` | Connexion des outils (HubSpot, Gmail, Google Calendar…) |
| `/dashboard/settings` | Profil, préférences des agents, abonnement |

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

Build de production :

```bash
npm run build
npm start
```

## Architecture & prochaines étapes

Les données sont pour l'instant **mockées** dans `src/lib/data.ts` (typées dans
`src/lib/types.ts`), afin que l'UI soit immédiatement démontrable. Pour aller vers un
produit réel :

1. **Backend / base de données** — remplacer les mocks par une API (ex. Supabase/Postgres)
   et charger les données via des Server Components.
2. **Authentification** — remplacer la connexion démo par un vrai flux (NextAuth, Clerk…).
3. **Agents IA réels** — brancher un LLM (API Claude) pour la qualification de leads,
   la rédaction de réponses et la génération de contenu.
4. **Intégrations** — implémenter les OAuth (HubSpot, Google, Meta…) derrière les boutons « Connecter ».
5. **Temps réel** — websockets pour le flux d'activité et les conversations.

## Structure

```
src/
├── app/
│   ├── layout.tsx            # layout racine (thème sombre, fonts, metadata)
│   ├── page.tsx              # connexion
│   └── dashboard/            # app authentifiée
│       ├── layout.tsx        # sidebar + contenu
│       ├── page.tsx          # vue d'ensemble
│       ├── agents/
│       ├── leads/
│       ├── conversations/
│       ├── integrations/
│       └── settings/
├── components/               # Logo, Sidebar, Topbar, StatCard, AgentCard, charts, Badge
└── lib/                      # types + données mock
```
