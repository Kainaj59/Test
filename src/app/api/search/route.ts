import { getLeads, getContent } from "@/lib/store";
import { normalizeText as norm } from "@/lib/text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = norm(new URL(request.url).searchParams.get("q") ?? "");
  if (q.length < 2) {
    return Response.json({ leads: [], content: [] });
  }

  const [allLeads, allContent] = await Promise.all([getLeads(), getContent()]);

  const leads = allLeads
    .filter((l) =>
      norm(`${l.name} ${l.company} ${l.email} ${l.source} ${l.status}`).includes(q),
    )
    .slice(0, 6)
    .map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      status: l.status,
    }));

  const content = allContent
    .filter((c) => norm(`${c.label} ${c.body} ${c.agent} ${c.kind}`).includes(q))
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      agent: c.agent,
      kind: c.kind,
      label: c.label,
      snippet: c.body.replace(/\s+/g, " ").slice(0, 80),
    }));

  return Response.json({ leads, content });
}
