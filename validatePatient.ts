import {
  AMPUTATION_COEFFICIENTS,
  PARALYSIS_COEFFICIENTS,
  type DisabilityType,
  type Gender,
} from "@/lib/calorie";

export interface ValidPatientPayload {
  fullName: string;
  gender: Gender;
  weight: number;
  height: number;
  activityCoefficient: number;
  disabilityType: DisabilityType;
  disabilityDetail: string;
}

export function validatePatientPayload(
  body: unknown
): { error: string } | { data: ValidPatientPayload } {
  if (typeof body !== "object" || body === null) {
    return { error: "بدنه درخواست نامعتبر است." };
  }

  const b = body as Record<string, unknown>;

  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  if (!fullName) return { error: "نام و نام خانوادگی الزامی است." };

  const gender = b.gender;
  if (gender !== "male" && gender !== "female") {
    return { error: "جنسیت باید مرد یا زن باشد." };
  }

  const weight = Number(b.weight);
  if (!Number.isFinite(weight) || weight <= 0) return { error: "وزن نامعتبر است." };

  const height = Number(b.height);
  if (!Number.isFinite(height) || height <= 0) return { error: "قد نامعتبر است." };

  const activityCoefficient = Number(b.activityCoefficient);
  if (!Number.isFinite(activityCoefficient) || activityCoefficient <= 0) {
    return { error: "ضریب فعالیت نامعتبر است." };
  }

  const disabilityType = b.disabilityType;
  if (disabilityType !== "amputation" && disabilityType !== "paralysis") {
    return { error: "نوع معلولیت نامعتبر است." };
  }

  const disabilityDetail = typeof b.disabilityDetail === "string" ? b.disabilityDetail : "";
  const validKeys =
    disabilityType === "amputation"
      ? Object.keys(AMPUTATION_COEFFICIENTS)
      : Object.keys(PARALYSIS_COEFFICIENTS);
  if (!validKeys.includes(disabilityDetail)) {
    return { error: "جزئیات معلولیت نامعتبر است." };
  }

  return {
    data: {
      fullName,
      gender: gender as Gender,
      weight,
      height,
      activityCoefficient,
      disabilityType: disabilityType as DisabilityType,
      disabilityDetail,
    },
  };
}
