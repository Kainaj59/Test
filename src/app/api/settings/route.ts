import { getSettings, saveSettings, type Settings } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getSettings());
}

export async function POST(request: Request) {
  let body: Partial<Settings>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const patch: Partial<Settings> = {};
  if (typeof body.fullName === "string") patch.fullName = body.fullName.slice(0, 120);
  if (typeof body.email === "string") patch.email = body.email.slice(0, 200);
  if (typeof body.company === "string") patch.company = body.company.slice(0, 120);
  if (typeof body.phone === "string") patch.phone = body.phone.slice(0, 40);
  if (typeof body.autoTransfer === "boolean") patch.autoTransfer = body.autoTransfer;
  if (typeof body.validateBeforePublish === "boolean")
    patch.validateBeforePublish = body.validateBeforePublish;
  if (typeof body.dailySummary === "boolean") patch.dailySummary = body.dailySummary;

  const saved = await saveSettings(patch);
  return Response.json({ ok: true, settings: saved });
}
