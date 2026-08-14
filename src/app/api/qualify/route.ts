import Anthropic from "@anthropic-ai/sdk";
import {
  SOFIA_MODEL,
  SOFIA_SYSTEM,
  QUALIFICATION_TOOL,
  type ChatMessage,
  type Qualification,
} from "@/lib/sofia";
import { addLead, qualificationToLead } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protocole de réponse : NDJSON streamé.
//   {"type":"text","value":"…"}                    — fragment de texte de Sofia
//   {"type":"meta","qualification":{…}|null,...}   — métadonnées finales
const enc = new TextEncoder();
function line(obj: unknown) {
  return enc.encode(JSON.stringify(obj) + "\n");
}

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content }));

  if (history.length === 0 || history[0].role !== "user") {
    return Response.json(
      { error: "La conversation doit commencer par un message du visiteur." },
      { status: 400 },
    );
  }

  const streamHeaders = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
  };

  // Pas de clé API : on renvoie tout de même un flux (message + meta) pour que
  // le client garde un chemin unique, sans planter.
  if (!process.env.ANTHROPIC_API_KEY) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          line({
            type: "text",
            value:
              "Je suis prête à discuter, mais la clé API Claude n'est pas encore configurée sur ce serveur. Ajoute la variable d'environnement ANTHROPIC_API_KEY puis relance — je pourrai alors qualifier le lead pour de vrai.",
          }),
        );
        controller.enqueue(line({ type: "meta", qualification: null, needsKey: true }));
        controller.close();
      },
    });
    return new Response(stream, { headers: streamHeaders });
  }

  const client = new Anthropic();

  // Sofia garde le contexte : historique + sortie structurée via tool use.
  const baseParams = {
    model: SOFIA_MODEL,
    max_tokens: 1024,
    system: SOFIA_SYSTEM,
    tools: [QUALIFICATION_TOOL],
    output_config: { effort: "low" },
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(line(obj));
      try {
        // Premier tour : Sofia pose une question (texte streamé) ou décide de
        // qualifier (bloc tool_use, sans texte visible).
        const s1 = client.messages.stream({
          ...baseParams,
          messages: history,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        s1.on("text", (delta: string) => send({ type: "text", value: delta }));
        const msg1 = await s1.finalMessage();

        let qualification: Qualification | null = null;
        let toolUseId: string | null = null;
        for (const block of msg1.content) {
          if (block.type === "tool_use" && block.name === QUALIFICATION_TOOL.name) {
            qualification = block.input as Qualification;
            toolUseId = block.id;
          }
        }

        // Qualification enregistrée → persiste le lead puis streame le message
        // de clôture de Sofia (réponse à l'outil).
        if (qualification && toolUseId) {
          await addLead(qualificationToLead(qualification));

          const s2 = client.messages.stream({
            ...baseParams,
            messages: [
              ...history,
              { role: "assistant", content: msg1.content },
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolUseId,
                    content: "Lead enregistré dans le CRM. Remercie et propose la démo.",
                  },
                ],
              },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
          s2.on("text", (delta: string) => send({ type: "text", value: delta }));
          await s2.finalMessage();
        }

        send({ type: "meta", qualification });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue.";
        send({
          type: "text",
          value:
            "Désolée, un souci technique m'empêche de répondre à l'instant. Réessaie dans un moment.",
        });
        send({ type: "meta", qualification: null, error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: streamHeaders });
}
