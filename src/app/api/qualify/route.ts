import Anthropic from "@anthropic-ai/sdk";
import {
  SOFIA_MODEL,
  SOFIA_SYSTEM,
  QUALIFICATION_TOOL,
  type ChatMessage,
  type Qualification,
} from "@/lib/sofia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      needsKey: true,
      reply:
        "Je suis prête à discuter, mais la clé API Claude n'est pas encore configurée sur ce serveur. Ajoute la variable d'environnement ANTHROPIC_API_KEY puis relance — je pourrai alors qualifier le lead pour de vrai.",
      qualification: null,
    });
  }

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

  const client = new Anthropic();

  // Sofia garde le contexte : historique + la sortie structurée via tool use.
  const baseParams = {
    model: SOFIA_MODEL,
    max_tokens: 1024,
    system: SOFIA_SYSTEM,
    tools: [QUALIFICATION_TOOL],
    output_config: { effort: "low" },
  };

  try {
    const response = await client.messages.create({
      ...baseParams,
      messages: history,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    let reply = "";
    let qualification: Qualification | null = null;
    let toolUseId: string | null = null;

    for (const block of response.content) {
      if (block.type === "text") reply += block.text;
      if (block.type === "tool_use" && block.name === QUALIFICATION_TOOL.name) {
        qualification = block.input as Qualification;
        toolUseId = block.id;
      }
    }

    // Si Sofia a enregistré la qualification, on lui renvoie le résultat de
    // l'outil pour qu'elle formule un message de clôture naturel.
    if (qualification && toolUseId) {
      const followUp = await client.messages.create({
        ...baseParams,
        messages: [
          ...history,
          { role: "assistant", content: response.content },
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

      const closing = followUp.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      if (closing) reply = closing;
    }

    if (!reply) {
      reply = "Peux-tu m'en dire un peu plus sur ton besoin ?";
    }

    return Response.json({ reply, qualification });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    return Response.json(
      {
        reply:
          "Désolée, un souci technique m'empêche de répondre à l'instant. Réessaie dans un moment.",
        qualification: null,
        error: message,
      },
      { status: 200 },
    );
  }
}
