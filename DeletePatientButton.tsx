"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePatientButton({
  patientId,
  patientName,
  redirectTo,
  className,
}: {
  patientId: number;
  patientName: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`آیا از حذف پرونده «${patientName}» مطمئن هستید؟`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("حذف با خطا مواجه شد.");
        setLoading(false);
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      alert("ارتباط با سرور برقرار نشد.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={
        className ??
        "rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
      }
    >
      {loading ? "در حال حذف..." : "حذف بیمار"}
    </button>
  );
}
