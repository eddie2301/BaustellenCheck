import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { entries, projects } from "@/db/schema";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return Response.json({ projects: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Daten konnten nicht geladen werden" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { title?: string; client?: string; address?: string; contractValue?: number; billingType?: string };
    if (!body.title?.trim()) return Response.json({ error: "Titel ist erforderlich" }, { status: 400 });
    const now = new Date().toISOString();
    const [project] = await getDb().insert(projects).values({
      title: body.title.trim(), client: body.client?.trim() ?? "", address: body.address?.trim() ?? "",
      contractValue: Number(body.contractValue) || 0, billingType: body.billingType || "undecided", createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Projekt konnte nicht gespeichert werden" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Ungültige Projekt-ID" }, { status: 400 });
  const db = getDb();
  await db.delete(entries).where(eq(entries.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  return Response.json({ ok: true });
}
