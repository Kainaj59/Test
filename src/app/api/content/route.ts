import { addContent, getContent } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ items: await getContent() });
}

export async function POST(request: Request) {
  let body: { agent?: string; kind?: string; label?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const agent = body.agent === "Max" ? "Max" : body.agent === "Nora" ? "Nora" : null;
  const kind = body.kind === "email" ? "email" : body.kind === "post" ? "post" : null;
  const label = (body.label ?? "").trim().slice(0, 120);
  const content = (body.body ?? "").trim().slice(0, 8000);

  if (!agent || !kind || !content) {
    return Response.json({ error: "Contenu incomplet." }, { status: 400 });
  }

  const item = await addContent({ agent, kind, label: label || agent, body: content });
  return Response.json({ ok: true, item });
}
