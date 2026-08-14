import Anthropic from "@anthropic-ai/sdk";
import {
  MAX_MODEL,
  MAX_SYSTEM,
  buildUserPrompt,
  TONES,
  LENGTHS,
  type Tone,
  type Length,
} from "@/lib/max";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Réponse : NDJSON streamé.
//   {"type":"text","value":"…"}  — fragment de l'email
//   {"type":"meta","needsKey":bool,"error"?:string}
const enc = new TextEncoder();
function line(obj: unknown) {
  return enc.encode(JSON.stringify(obj) + "\n");
}

export async function POST(request: Request) {
  let body: { context?: string; goal?: string; tone?: string; length?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const context = (body.context ?? "").trim().slice(0, 4000);
  const goal = (body.goal ?? "").trim().slice(0, 500);
  const tone = (TONES as readonly string[]).includes(body.tone ?? "")
    ? (body.tone as Tone)
    : "Professionnel";
  const length = (LENGTHS as readonly string[]).includes(body.length ?? "")
    ? (body.length as Length)
    : "Moyen";

  if (!context) {
    return Response.json(
      { error: "Le contexte (email reçu) est vide." },
      { status: 400 },
    );
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
              "Objet : (Démo) Configuration requise\n\nBonjour,\n\nLa clé API Claude n'est pas encore configurée sur ce serveur. Ajoute ANTHROPIC_API_KEY et je rédigerai de vraies réponses, adaptées au contexte, au ton et à la longueur choisis.\n\nBien à vous,\nStudio Nexora",
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
          model: MAX_MODEL,
          max_tokens: 1024,
          system: MAX_SYSTEM,
          output_config: { effort: "low" },
          messages: [
            { role: "user", content: buildUserPrompt(context, goal, tone, length) },
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        s.on("text", (delta: string) => send({ type: "text", value: delta }));
        await s.finalMessage();
        send({ type: "meta" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue.";
        send({
          type: "text",
          value: "Désolé, la rédaction a échoué. Réessaie dans un moment.",
        });
        send({ type: "meta", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: streamHeaders });
}
