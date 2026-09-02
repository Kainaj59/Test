import Anthropic from "@anthropic-ai/sdk";
import {
  LUMIBNB_MODEL,
  LUMIBNB_SYSTEM,
  PHOTO_REVIEW_TOOL,
  DEMO_REVIEW,
  IMAGE_MEDIA_TYPES,
  MAX_IMAGE_BASE64_LENGTH,
  type ImageMediaType,
  type PhotoReview,
} from "@/lib/lumibnb";
import { clampAdjustments } from "@/lib/photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { image?: string; mediaType?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const image = (body.image ?? "").trim();
  const mediaType = body.mediaType ?? "";

  if (!IMAGE_MEDIA_TYPES.includes(mediaType as ImageMediaType)) {
    return Response.json(
      { error: "Format d'image non supporté (JPEG, PNG ou WebP attendu)." },
      { status: 400 },
    );
  }
  if (image.length < 100) {
    return Response.json({ error: "Aucune image reçue." }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_BASE64_LENGTH) {
    return Response.json(
      { error: "Image trop lourde — réessaie, l'aperçu sera compressé automatiquement." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ needsKey: true, review: DEMO_REVIEW });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: LUMIBNB_MODEL,
      max_tokens: 1200,
      system: LUMIBNB_SYSTEM,
      tools: [PHOTO_REVIEW_TOOL],
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as ImageMediaType,
                data: image,
              },
            },
            {
              type: "text",
              text: "Voici une photo destinée à mon annonce de location courte durée. Évalue-la et dis-moi comment la rendre plus attractive.",
            },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    let review: PhotoReview | null = null;
    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === PHOTO_REVIEW_TOOL.name) {
        review = block.input as PhotoReview;
      }
    }

    if (!review) {
      return Response.json(
        { error: "L'analyse n'a pas pu être structurée. Réessaie avec une autre photo." },
        { status: 200 },
      );
    }

    // Garde-fou : on borne les réglages suggérés par l'IA avant de les renvoyer au studio.
    review.adjustments = clampAdjustments(review.adjustments ?? {});

    return Response.json({ review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    return Response.json(
      { error: "L'analyse a échoué. Réessaie dans un moment.", detail: message },
      { status: 200 },
    );
  }
}
