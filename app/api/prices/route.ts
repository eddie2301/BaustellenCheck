import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { priceItems } from "@/db/schema";

export async function GET() {
  try { return Response.json({ prices: await getDb().select().from(priceItems).orderBy(asc(priceItems.category), asc(priceItems.name)) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Fehler" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { category?: string; name?: string; unit?: string; costPrice?: number; salesPrice?: number };
    if (!body.name || !body.category || !body.unit) return Response.json({ error: "Pflichtangaben fehlen" }, { status: 400 });
    const [price] = await getDb().insert(priceItems).values({ category: body.category, name: body.name, unit: body.unit, costPrice: Number(body.costPrice)||0, salesPrice: Number(body.salesPrice)||0, updatedAt: new Date().toISOString() }).returning();
    return Response.json({ price }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Preis konnte nicht gespeichert werden" }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { id?: number; category?: string; name?: string; unit?: string; costPrice?: number; salesPrice?: number; active?: boolean };
    if (!body.id || !body.name || !body.category || !body.unit) return Response.json({ error: "Pflichtangaben fehlen" }, { status: 400 });
    const [price] = await getDb().update(priceItems).set({ category: body.category, name: body.name, unit: body.unit, costPrice: Number(body.costPrice)||0, salesPrice: Number(body.salesPrice)||0, active: body.active ?? true, updatedAt: new Date().toISOString() }).where(eq(priceItems.id, body.id)).returning();
    return Response.json({ price });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Preis konnte nicht geändert werden" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Ungültige ID" }, { status: 400 });
  await getDb().update(priceItems).set({ active: false, updatedAt: new Date().toISOString() }).where(eq(priceItems.id, id));
  return Response.json({ ok: true });
}
