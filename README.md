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
  — réponses **streamées en NDJSON** (Sofia « tape » token par token)
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

## Agent IA fonctionnel — Nora (contenu réseaux sociaux)

Deuxième agent réel : **Agents IA → Nora → « Tester en direct »**
(`/dashboard/agents/nora`). Décris un sujet, choisis la **plateforme**
(LinkedIn / Instagram / TikTok) et le **ton**, et Nora **rédige un post
prêt à publier**, streamé token par token, dans un aperçu façon réseau social
(hashtags mis en valeur, bouton copier, régénérer).

- Endpoint : `src/app/api/generate-post/route.ts` (NDJSON streamé, `claude-opus-5`)
- Prompt & options : `src/lib/nora.ts`
- Studio : `src/app/dashboard/agents/nora/page.tsx`

Même clé `ANTHROPIC_API_KEY` que Sofia.

## Agent IA fonctionnel — Max (assistant email)

Troisième agent réel : **Agents IA → Max → « Tester en direct »**
(`/dashboard/agents/max`). Colle un email reçu (ou un contexte), précise
l'objectif, le **ton** et la **longueur**, et Max **rédige une réponse prête à
envoyer** (objet + corps), streamée en direct, avec bouton copier. Rédaction
assistée uniquement — pas d'envoi ni d'OAuth.

- Endpoint : `src/app/api/draft-email/route.ts` (NDJSON streamé, `claude-opus-5`)
- Prompt & options : `src/lib/max.ts`
- Studio : `src/app/dashboard/agents/max/page.tsx`

## Bibliothèque de contenus

Les posts (Nora) et emails (Max) peuvent être **enregistrés** (bouton
« Enregistrer » dans chaque studio) et retrouvés dans **Contenus**
(`/dashboard/content`), filtrables par agent, avec copie en un clic.

- Persistance : `getContent()` / `addContent()` dans `src/lib/store.ts`
  (fichier `.data/content.json`, même modèle que les leads)
- Endpoint : `src/app/api/content/route.ts`

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

La **Vue d'ensemble** est également alimentée par le store : le compteur
« Leads qualifiés », le « Pipeline » et le flux d'activité reflètent en direct
les leads (dont ceux qualifiés par Sofia). Les autres métriques (appels, heures
économisées, graphiques) restent des données de démo.

## Pages

| Route | Description |
| --- | --- |
| `/` | **Site vitrine** : hero, agents, fonctionnement, intégrations, tarifs, CTA |
| `/login` | Écran de connexion (démo — cliquez sur « Se connecter ») |
| `/dashboard` | Vue d'ensemble : KPIs (leads/pipeline live), graphiques, activité |
| `/dashboard/agents` | Agents IA + « Tester en direct » (Sofia, Nora, Max) |
| `/dashboard/leads` | Table des leads : scoring, filtres, export CSV |
| `/dashboard/content` | Bibliothèque des contenus générés (posts, emails) |
| `/dashboard/conversations` | Boîte de réception unifiée multi-canal |
| `/dashboard/integrations` | Connexion des outils (HubSpot, Gmail, Google Calendar…) |
| `/dashboard/settings` | Profil, préférences des agents, abonnement |

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
cp .env.example .env.local   # puis renseigne ANTHROPIC_API_KEY pour activer les agents
```

Build de production :

```bash
npm run build
npm start
```

Tests :

```bash
npm test         # lanceur intégré de Node (aucune dépendance de test)
```

## État réel du projet

Ce qui est **réellement fonctionnel** :

- **3 agents IA branchés à l'API Claude** (Sofia, Nora, Max), réponses **streamées**.
- **Persistance locale** via `src/lib/store.ts` (fichiers `.data/*.json`) : leads,
  contenus et réglages. Durable en local / hébergement Node ; sur serverless
  (disque éphémère) l'écriture retombe sur un cache mémoire.
- **Boucle de données cohérente** : un lead qualifié par Sofia remonte dans
  Leads, la Vue d'ensemble (compteur, pipeline, activité) et Conversations.
- **Filtres + export CSV** des leads, **bibliothèque de contenus**, **recherche
  globale**, **réglages persistés**, **site vitrine**, **navigation mobile** et
  **sidebar repliable**.

Ce qui reste **de la démo** (données de `src/lib/data.ts`) : agents Léo (téléphone)
et Ava (RDV), métriques plateforme (heures/appels/graphiques), page Intégrations.

### Prochaines étapes (nécessitent des services externes)

1. **Base de données** (Supabase/Postgres) — réimplémenter `store.ts`, rien
   d'autre à changer dans l'app.
2. **Authentification réelle** (NextAuth/Clerk) à la place de la connexion démo.
3. **Léo / Ava** — téléphonie (Twilio) et agenda (OAuth Google).
4. **Envoi réel** (emails via Gmail, publication réseaux via Meta/LinkedIn).

## Structure

```
src/
├── app/
│   ├── layout.tsx              # layout racine (thème sombre, fonts, metadata)
│   ├── page.tsx                # site vitrine (landing + tarifs + FAQ)
│   ├── login/                  # connexion (démo)
│   ├── not-found.tsx           # 404 stylée
│   ├── api/                    # qualify, generate-post, draft-email, content,
│   │                           # leads/export, search, settings
│   └── dashboard/              # app
│       ├── layout.tsx          # sidebar + contenu
│       ├── loading.tsx         # squelette de chargement
│       ├── page.tsx            # vue d'ensemble (live)
│       ├── agents/             # + studios sofia / nora / max
│       ├── leads/  content/  conversations/  integrations/  settings/
├── components/                 # Logo, Sidebar, MobileNav, Topbar, GlobalSearch,
│                               # StatCard, AgentCard, charts, Badge, Save/CopyButton…
└── lib/                        # store, sofia, nora, max, text (testé), data, types

tests/                          # tests unitaires (node --test) — hors src/
```
