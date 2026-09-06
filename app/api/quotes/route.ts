import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { quoteItems, quotes } from "@/db/schema";
import { calculateQuote, calculateVariance } from "@/lib/calculation";

export async function GET(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Angebots-ID fehlt" }, { status: 400 });
    const db = getDb(); const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return Response.json({ error: "Angebot nicht gefunden" }, { status: 404 });
    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id)).orderBy(asc(quoteItems.position));
    return Response.json({ quote, items, totals: calculateQuote(items, quote.overheadPct, quote.riskPct, quote.vatPct), variance: calculateVariance(items) });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Fehler" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { title?: string; customerRequest?: string; projectId?: number; overheadPct?: number; riskPct?: number; vatPct?: number; items?: Array<{priceItemId?:number;description:string;unit:string;quantity:number;unitCost:number;unitPrice:number}> };
    if (!body.title?.trim()) return Response.json({ error: "Titel ist erforderlich" }, { status: 400 });
    const now = new Date().toISOString(); const db = getDb();
    const [quote] = await db.insert(quotes).values({ title: body.title.trim(), customerRequest: body.customerRequest ?? "", projectId: body.projectId ?? null, overheadPct: body.overheadPct ?? 10, riskPct: body.riskPct ?? 5, vatPct: body.vatPct ?? 19, createdAt: now, updatedAt: now }).returning();
    const rawItems = body.items ?? [];
    if (rawItems.length) await db.insert(quoteItems).values(rawItems.map((item, index) => ({ quoteId: quote.id, priceItemId: item.priceItemId ?? null, position: index + 1, description: item.description, unit: item.unit, quantity: Number(item.quantity)||0, unitCost: Number(item.unitCost)||0, unitPrice: Number(item.unitPrice)||0 })));
    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quote.id)).orderBy(asc(quoteItems.position));
    return Response.json({ quote, items, totals: calculateQuote(items, quote.overheadPct, quote.riskPct, quote.vatPct) }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Angebot konnte nicht gespeichert werden" }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { id?:number; title?:string; customerRequest?:string; status?:string; overheadPct?:number; riskPct?:number; vatPct?:number; items?:Array<{priceItemId?:number;description:string;unit:string;quantity:number;unitCost:number;unitPrice:number;actualQuantity?:number;invoicedQuantity?:number}> };
    if (!body.id || !body.title?.trim()) return Response.json({ error: "Pflichtangaben fehlen" }, { status: 400 });
    const db=getDb(); const now=new Date().toISOString();
    const [quote]=await db.update(quotes).set({title:body.title.trim(),customerRequest:body.customerRequest??"",status:body.status??"draft",overheadPct:body.overheadPct??10,riskPct:body.riskPct??5,vatPct:body.vatPct??19,updatedAt:now}).where(eq(quotes.id,body.id)).returning();
    await db.delete(quoteItems).where(eq(quoteItems.quoteId,body.id));
    if(body.items?.length) await db.insert(quoteItems).values(body.items.map((item,index)=>({quoteId:body.id!,priceItemId:item.priceItemId??null,position:index+1,description:item.description,unit:item.unit,quantity:Number(item.quantity)||0,unitCost:Number(item.unitCost)||0,unitPrice:Number(item.unitPrice)||0,actualQuantity:Number(item.actualQuantity)||0,invoicedQuantity:Number(item.invoicedQuantity)||0})));
    const items=await db.select().from(quoteItems).where(eq(quoteItems.quoteId,body.id)).orderBy(asc(quoteItems.position));
    return Response.json({quote,items,totals:calculateQuote(items,quote.overheadPct,quote.riskPct,quote.vatPct),variance:calculateVariance(items)});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Angebot konnte nicht geändert werden"},{status:500})}
}
