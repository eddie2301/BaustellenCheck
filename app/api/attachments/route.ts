import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { attachments } from "@/db/schema";

const bucket = () => (env as unknown as { BUCKET: R2Bucket }).BUCKET;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(request: Request) {
  try {
    const data = await request.formData(); const file = data.get("file");
    const projectId = Number(data.get("projectId")); const entryId = Number(data.get("entryId")) || null;
    if (!(file instanceof File) || !projectId) return Response.json({ error: "Datei und Projekt sind erforderlich" }, { status: 400 });
    if (!allowed.has(file.type)) return Response.json({ error: "Nur JPG, PNG, WEBP oder PDF" }, { status: 415 });
    if (file.size > 15 * 1024 * 1024) return Response.json({ error: "Datei ist größer als 15 MB" }, { status: 413 });
    const key = `projects/${projectId}/${crypto.randomUUID()}`;
    await bucket().put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name } });
    const [attachment] = await getDb().insert(attachments).values({ projectId, entryId, fileName: file.name, contentType: file.type, sizeBytes: file.size, objectKey: key, createdAt: new Date().toISOString() }).returning();
    return Response.json({ attachment }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Upload fehlgeschlagen" }, { status: 500 }); }
}

export async function GET(request: Request) {
  const url = new URL(request.url); const projectId = Number(url.searchParams.get("projectId"));
  if (projectId) {
    const rows = await getDb().select({ id: attachments.id, projectId: attachments.projectId, entryId: attachments.entryId, fileName: attachments.fileName, contentType: attachments.contentType, sizeBytes: attachments.sizeBytes, createdAt: attachments.createdAt }).from(attachments).where(eq(attachments.projectId, projectId)).orderBy(desc(attachments.createdAt));
    return Response.json({ attachments: rows });
  }
  const id = Number(url.searchParams.get("id"));
  if (!id) return Response.json({ error: "Datei-ID fehlt" }, { status: 400 });
  const [row] = await getDb().select().from(attachments).where(eq(attachments.id, id));
  if (!row) return Response.json({ error: "Datei nicht gefunden" }, { status: 404 });
  const object = await bucket().get(row.objectKey); if (!object) return Response.json({ error: "Datei fehlt" }, { status: 404 });
  return new Response(object.body, { headers: { "content-type": row.contentType, "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.fileName)}`, "cache-control": "private, max-age=3600" } });
}
