"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AMPUTATION_OPTIONS,
  PARALYSIS_OPTIONS,
  type DisabilityType,
  type Gender,
} from "@/lib/calorie";

export interface PatientFormInitialData {
  fullName: string;
  gender: Gender;
  weight: number;
  height: number;
  activityCoefficient: number;
  disabilityType: DisabilityType;
  disabilityDetail: string;
}

const ACTIVITY_PRESETS = [
  { label: "بسیار کم‌تحرک", value: 1.2 },
  { label: "کم‌تحرک", value: 1.375 },
  { label: "فعالیت متوسط", value: 1.55 },
  { label: "فعالیت زیاد", value: 1.725 },
  { label: "فعالیت بسیار زیاد", value: 1.9 },
];

function groupOptions(options: typeof AMPUTATION_OPTIONS) {
  const groups = new Map<string, typeof AMPUTATION_OPTIONS>();
  for (const option of options) {
    const list = groups.get(option.group) ?? [];
    list.push(option);
    groups.set(option.group, list);
  }
  return Array.from(groups.entries());
}

export default function PatientForm({
  mode,
  patientId,
  initialData,
}: {
  mode: "create" | "edit";
  patientId?: number;
  initialData?: PatientFormInitialData;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [gender, setGender] = useState<Gender>(initialData?.gender ?? "male");
  const [weight, setWeight] = useState(initialData?.weight?.toString() ?? "");
  const [height, setHeight] = useState(initialData?.height?.toString() ?? "");
  const [activityCoefficient, setActivityCoefficient] = useState(
    initialData?.activityCoefficient?.toString() ?? "1.2"
  );
  const [disabilityType, setDisabilityType] = useState<DisabilityType>(
    initialData?.disabilityType ?? "amputation"
  );
  const [disabilityDetail, setDisabilityDetail] = useState(
    initialData?.disabilityDetail ?? AMPUTATION_OPTIONS[0].key
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = disabilityType === "amputation" ? AMPUTATION_OPTIONS : PARALYSIS_OPTIONS;
  const groupedOptions = useMemo(() => groupOptions(options), [options]);

  function handleDisabilityTypeChange(type: DisabilityType) {
    setDisabilityType(type);
    const nextOptions = type === "amputation" ? AMPUTATION_OPTIONS : PARALYSIS_OPTIONS;
    setDisabilityDetail(nextOptions[0].key);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      fullName,
      gender,
      weight: Number(weight),
      height: Number(height),
      activityCoefficient: Number(activityCoefficient),
      disabilityType,
      disabilityDetail,
    };

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/patients" : `/api/patients/${patientId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "خطایی رخ داد.");
        setSubmitting(false);
        return;
      }
      const id = json.patient?.id ?? patientId;
      router.push(`/patients/${id}`);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(16,24,40,0.08)] sm:p-10"
    >
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-800">اطلاعات اولیه</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              نام و نام خانوادگی
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none ring-teal-500/40 transition focus:border-teal-500 focus:ring-4"
              placeholder="مثلاً: علی رضایی"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">جنسیت</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  gender === "male"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                مرد
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  gender === "female"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                زن
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">وزن (کیلوگرم)</label>
            <input
              required
              type="number"
              step="0.1"
              min="1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none ring-teal-500/40 transition focus:border-teal-500 focus:ring-4"
              placeholder="مثلاً: 70"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">قد (سانتی‌متر)</label>
            <input
              required
              type="number"
              step="0.1"
              min="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none ring-teal-500/40 transition focus:border-teal-500 focus:ring-4"
              placeholder="مثلاً: 170"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              ضریب فعالیت (به‌صورت دستی وارد کنید)
            </label>
            <input
              required
              type="number"
              step="0.001"
              min="0.1"
              value={activityCoefficient}
              onChange={(e) => setActivityCoefficient(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none ring-teal-500/40 transition focus:border-teal-500 focus:ring-4"
              placeholder="مثلاً: 1.2"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTIVITY_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => setActivityCoefficient(preset.value.toString())}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-teal-400 hover:text-teal-700"
                >
                  {preset.label} ({preset.value})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-800">میزان معلولیت</h2>
        <div className="mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => handleDisabilityTypeChange("amputation")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              disabilityType === "amputation"
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            قطع عضو
          </button>
          <button
            type="button"
            onClick={() => handleDisabilityTypeChange("paralysis")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              disabilityType === "paralysis"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            فلج
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            جزئیات عضو دارای معلولیت
          </label>
          <select
            value={disabilityDetail}
            onChange={(e) => setDisabilityDetail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none ring-teal-500/40 transition focus:border-teal-500 focus:ring-4"
          >
            {groupedOptions.map(([group, groupItems]) => (
              <optgroup key={group} label={group}>
                {groupItems.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-60"
        >
          {submitting ? "در حال ذخیره..." : mode === "create" ? "ثبت بیمار" : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
