import Anthropic from "@anthropic-ai/sdk";
import {
  NORA_MODEL,
  NORA_SYSTEM,
  buildUserPrompt,
  PLATFORMS,
  TONES,
  type Platform,
  type Tone,
} from "@/lib/nora";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Réponse : NDJSON streamé.
//   {"type":"text","value":"…"}  — fragment du post
//   {"type":"meta","needsKey":bool,"error"?:string}
const enc = new TextEncoder();
function line(obj: unknown) {
  return enc.encode(JSON.stringify(obj) + "\n");
}

export async function POST(request: Request) {
  let body: { brief?: string; platform?: string; tone?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim().slice(0, 2000);
  const platform = (PLATFORMS as readonly string[]).includes(body.platform ?? "")
    ? (body.platform as Platform)
    : "LinkedIn";
  const tone = (TONES as readonly string[]).includes(body.tone ?? "")
    ? (body.tone as Tone)
    : "Professionnel";

  if (!brief) {
    return Response.json({ error: "Le brief est vide." }, { status: 400 });
  }

  const streamHeaders = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          line({
            type: "text",
            value:
              "✨ (Démo) La clé API Claude n'est pas encore configurée sur ce serveur. Ajoute ANTHROPIC_API_KEY pour que je génère de vrais posts, personnalisés selon la plateforme et le ton.\n\n#Nexora #IA #Automatisation",
          }),
        );
        controller.enqueue(line({ type: "meta", needsKey: true }));
        controller.close();
      },
    });
    return new Response(stream, { headers: streamHeaders });
  }

  const client = new Anthropic();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(line(obj));
      try {
        const s = client.messages.stream({
          model: NORA_MODEL,
          max_tokens: 1024,
          system: NORA_SYSTEM,
          output_config: { effort: "low" },
          messages: [{ role: "user", content: buildUserPrompt(brief, platform, tone) }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        s.on("text", (delta: string) => send({ type: "text", value: delta }));
        await s.finalMessage();
        send({ type: "meta" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue.";
        send({
          type: "text",
          value: "Désolée, la génération a échoué. Réessaie dans un moment.",
        });
        send({ type: "meta", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: streamHeaders });
}
