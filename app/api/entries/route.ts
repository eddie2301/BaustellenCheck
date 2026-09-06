import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { entries, projects } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const projectId = Number(new URL(request.url).searchParams.get("projectId"));
    if (!projectId) return Response.json({ entries: [] });
    return Response.json({ entries: await getDb().select().from(entries).where(eq(entries.projectId, projectId)).orderBy(desc(entries.createdAt)) });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Fehler" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { projectId?: number; type?: string; title?: string; description?: string; people?: number; hoursPerPerson?: number; amount?: number; workerName?: string; travelHours?: number; invoiced?: boolean };
    if (!body.projectId || !body.type || !body.title) return Response.json({ error: "Pflichtangaben fehlen" }, { status: 400 });
    const now = new Date().toISOString(); const db = getDb();
    const [entry] = await db.insert(entries).values({ projectId: body.projectId, type: body.type, title: body.title, description: body.description ?? "", people: body.people ?? null, hoursPerPerson: body.hoursPerPerson ?? null, amount: body.amount ?? null, workerName: body.workerName ?? null, travelHours: body.travelHours ?? null, invoiced: body.invoiced ?? false, createdAt: now }).returning();
    await db.update(projects).set({ updatedAt: now }).where(eq(projects.id, body.projectId));
    return Response.json({ entry }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Eintrag konnte nicht gespeichert werden" }, { status: 500 }); }
}
