import Link from "next/link";
import PatientForm from "@/components/PatientForm";

export default function NewPatientPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-8">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-teal-600 hover:text-teal-700">
          ← بازگشت به لیست بیماران
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          ثبت بیمار جدید
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات اولیه و میزان معلولیت بیمار را وارد کنید تا محاسبات کالری به‌صورت خودکار انجام شود.
        </p>
      </div>
      <PatientForm mode="create" />
    </main>
  );
}
