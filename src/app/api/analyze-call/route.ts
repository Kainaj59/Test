import Anthropic from "@anthropic-ai/sdk";
import {
  LEO_MODEL,
  LEO_SYSTEM,
  ANALYSIS_TOOL,
  DEMO_ANALYSIS,
  type CallAnalysis,
} from "@/lib/analyst";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { transcript?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const transcript = (body.transcript ?? "").trim().slice(0, 60000);
  if (transcript.length < 40) {
    return Response.json(
      { error: "Colle un transcript un peu plus long pour l'analyser." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ needsKey: true, analysis: DEMO_ANALYSIS });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: LEO_MODEL,
      max_tokens: 1500,
      system: LEO_SYSTEM,
      tools: [ANALYSIS_TOOL],
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: `Transcript de l'appel / de la réunion à analyser :\n\n${transcript}`,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    let analysis: CallAnalysis | null = null;
    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === ANALYSIS_TOOL.name) {
        analysis = block.input as CallAnalysis;
      }
    }

    if (!analysis) {
      return Response.json(
        {
          error:
            "L'analyse n'a pas pu être structurée. Réessaie avec un transcript plus clair.",
        },
        { status: 200 },
      );
    }

    return Response.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    return Response.json(
      { error: "L'analyse a échoué. Réessaie dans un moment.", detail: message },
      { status: 200 },
    );
  }
}
