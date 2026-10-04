import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validatePatientPayload } from "@/lib/validatePatient";

export const dynamic = "force-dynamic";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });

  const [patient] = await db.select().from(patients).where(eq(patients.id, id));
  if (!patient) return NextResponse.json({ error: "بیمار پیدا نشد." }, { status: 404 });

  return NextResponse.json({ patient });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const result = validatePatientPayload(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const [updated] = await db
    .update(patients)
    .set(result.data)
    .where(eq(patients.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "بیمار پیدا نشد." }, { status: 404 });

  return NextResponse.json({ patient: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });

  const [deleted] = await db.delete(patients).where(eq(patients.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: "بیمار پیدا نشد." }, { status: 404 });

  return NextResponse.json({ success: true });
}
