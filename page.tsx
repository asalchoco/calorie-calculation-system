import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import PatientForm from "@/components/PatientForm";
import type { DisabilityType, Gender } from "@/lib/calorie";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [patient] = await db.select().from(patients).where(eq(patients.id, id));
  if (!patient) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-8">
      <div className="mb-8">
        <Link
          href={`/patients/${id}`}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← بازگشت به پرونده بیمار
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          ویرایش اطلاعات بیمار
        </h1>
      </div>
      <PatientForm
        mode="edit"
        patientId={patient.id}
        initialData={{
          fullName: patient.fullName,
          gender: patient.gender as Gender,
          weight: patient.weight,
          height: patient.height,
          activityCoefficient: patient.activityCoefficient,
          disabilityType: patient.disabilityType as DisabilityType,
          disabilityDetail: patient.disabilityDetail,
        }}
      />
    </main>
  );
}
