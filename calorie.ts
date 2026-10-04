// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export type Gender = "male" | "female";
export type DisabilityType = "amputation" | "paralysis";

export interface DisabilityOption {
  key: string;
  label: string;
  group: string;
}

// ---------------------------------------------------------------------------
// Amputation (قطع عضو) options -> single coefficient (percentage of ideal body mass)
// ---------------------------------------------------------------------------

export const AMPUTATION_COEFFICIENTS: Record<string, number> = {
  hand_wrist_1: 0.93, // دست از مچ به پایین
  hand_elbow_1: 0.977, // دست از آرنج به پایین
  hand_full_1: 0.95, // یک دست کامل
  leg_ankle_1: 0.985, // پا از مچ به پایین
  leg_knee_1: 0.941, // پا از زانو به پایین
  leg_full_1: 0.84, // یک پا کامل
  hand_wrist_2: 0.86, // دو دست از مچ به پایین
  hand_elbow_2: 0.954, // دو دست از آرنج به پایین
  hand_full_2: 0.9, // دو دست کامل
  leg_ankle_2: 0.97, // دو پا از مچ به پایین
  leg_knee_2: 0.882, // دو پا از زانو به پایین
  leg_full_2: 0.68, // دو پا کامل
};

export const AMPUTATION_OPTIONS: DisabilityOption[] = [
  { key: "hand_wrist_1", label: "دست از مچ به پایین (یک دست)", group: "قطع عضو دست - یک طرف" },
  { key: "hand_elbow_1", label: "دست از آرنج به پایین (یک دست)", group: "قطع عضو دست - یک طرف" },
  { key: "hand_full_1", label: "یک دست کامل", group: "قطع عضو دست - یک طرف" },
  { key: "hand_wrist_2", label: "دو دست از مچ به پایین", group: "قطع عضو دست - دو طرف" },
  { key: "hand_elbow_2", label: "دو دست از آرنج به پایین", group: "قطع عضو دست - دو طرف" },
  { key: "hand_full_2", label: "دو دست کامل", group: "قطع عضو دست - دو طرف" },
  { key: "leg_ankle_1", label: "پا از مچ به پایین (یک پا)", group: "قطع عضو پا - یک طرف" },
  { key: "leg_knee_1", label: "پا از زانو به پایین (یک پا)", group: "قطع عضو پا - یک طرف" },
  { key: "leg_full_1", label: "یک پا کامل", group: "قطع عضو پا - یک طرف" },
  { key: "leg_ankle_2", label: "دو پا از مچ به پایین", group: "قطع عضو پا - دو طرف" },
  { key: "leg_knee_2", label: "دو پا از زانو به پایین", group: "قطع عضو پا - دو طرف" },
  { key: "leg_full_2", label: "دو پا کامل", group: "قطع عضو پا - دو طرف" },
];

// ---------------------------------------------------------------------------
// Paralysis (فلج) options -> two coefficients: one for min-BMI weight, one for max-BMI weight
// ---------------------------------------------------------------------------

export const PARALYSIS_COEFFICIENTS: Record<string, { min: number; max: number }> = {
  paraplegia: { min: 0.9, max: 0.95 }, // فلج دو پا
  quadriplegia: { min: 0.85, max: 0.9 }, // فلج از گردن به پایین
};

export const PARALYSIS_OPTIONS: DisabilityOption[] = [
  { key: "paraplegia", label: "فلج دو پا", group: "فلج" },
  { key: "quadriplegia", label: "فلج از گردن به پایین", group: "فلج" },
];

export function getDisabilityOptions(type: DisabilityType): DisabilityOption[] {
  return type === "amputation" ? AMPUTATION_OPTIONS : PARALYSIS_OPTIONS;
}

export function getDisabilityLabel(type: DisabilityType, key: string): string {
  const options = getDisabilityOptions(type);
  return options.find((o) => o.key === key)?.label ?? key;
}

// ---------------------------------------------------------------------------
// Custom rounding rule:
// - exact .5 decimal stays .5
// - decimal above .5 rounds UP to next integer
// - decimal below .5 rounds DOWN to lower integer
// ---------------------------------------------------------------------------

export function customRound(value: number): number {
  const base = Math.floor(value);
  const frac = Math.round((value - base) * 100) / 100; // 2-decimal safety buffer
  const frac1 = Math.round(frac * 10) / 10; // reduce to a single decimal digit

  if (Math.abs(frac1 - 0.5) < 1e-9) return base + 0.5;
  if (frac1 > 0.5) return base + 1;
  return base;
}

export function formatRounded(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function formatRaw(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

// ---------------------------------------------------------------------------
// Calculation engine
// ---------------------------------------------------------------------------

export interface PatientInput {
  gender: Gender;
  weight: number; // kg - current weight entered for the patient
  height: number; // cm
  activityCoefficient: number;
  disabilityType: DisabilityType;
  disabilityDetail: string;
}

export type WeightStatus = "normal" | "underweight" | "overweight";

export interface CalculationStep {
  title: string;
  formula: string;
  result: string;
}

export interface CalculationResult {
  heightM: number;
  genderFactor: number;
  disabilityLabel: string;
  coefficientDescription: string;
  bmiMinRaw: number;
  bmiMaxRaw: number;
  minWeight: number;
  maxWeight: number;
  status: WeightStatus;
  statusLabel: string;
  idealWeightRaw?: number;
  idealWeight?: number;
  adjustedWeight?: number;
  baseCalorie: number;
  adjustment: number;
  finalCalorie: number;
  steps: CalculationStep[];
}

const STATUS_LABELS: Record<WeightStatus, string> = {
  normal: "وزن نرمال (در محدوده مجاز)",
  underweight: "کمبود وزن (زیر محدوده مجاز)",
  overweight: "اضافه وزن (بالای محدوده مجاز)",
};

export const STATUS_SHORT_LABELS: Record<WeightStatus, string> = {
  normal: "نرمال",
  underweight: "کمبود وزن",
  overweight: "اضافه وزن",
};

export function calculatePatient(input: PatientInput): CalculationResult {
  const { gender, weight, height, activityCoefficient, disabilityType, disabilityDetail } = input;

  const heightM = height / 100;
  const genderFactor = gender === "male" ? 1 : 0.95;
  const disabilityLabel = getDisabilityLabel(disabilityType, disabilityDetail);

  const bmiMinRaw = 18.5 * heightM * heightM;
  const bmiMaxRaw = 25 * heightM * heightM;
  const bmiIdealRaw = 23 * heightM * heightM;

  const steps: CalculationStep[] = [];

  let minCoef: number;
  let maxCoef: number;
  let idealCoef: number;
  let coefficientDescription: string;

  if (disabilityType === "amputation") {
    const coef = AMPUTATION_COEFFICIENTS[disabilityDetail];
    minCoef = coef;
    maxCoef = coef;
    idealCoef = coef;
    coefficientDescription = `ضریب معلولیت برای «${disabilityLabel}»: ${(coef * 100).toFixed(1)}٪`;
  } else {
    const coefs = PARALYSIS_COEFFICIENTS[disabilityDetail];
    minCoef = coefs.min;
    maxCoef = coefs.max;
    idealCoef = coefs.min;
    coefficientDescription = `ضریب معلولیت برای «${disabilityLabel}»: کمترین BMI = ${(coefs.min * 100).toFixed(
      0
    )}٪ , بیشترین BMI = ${(coefs.max * 100).toFixed(0)}٪`;
  }

  const minWeight = customRound(bmiMinRaw * minCoef);
  const maxWeight = customRound(bmiMaxRaw * maxCoef);

  steps.push({
    title: "۱) محاسبه وزن با کمترین BMI (۱۸.۵)",
    formula: `18.5 × (${heightM.toFixed(2)})² × ${minCoef} = ${bmiMinRaw.toFixed(2)} × ${minCoef}`,
    result: `${formatRounded(minWeight)} کیلوگرم`,
  });

  steps.push({
    title: "۲) محاسبه وزن با بیشترین BMI (۲۵)",
    formula: `25 × (${heightM.toFixed(2)})² × ${maxCoef} = ${bmiMaxRaw.toFixed(2)} × ${maxCoef}`,
    result: `${formatRounded(maxWeight)} کیلوگرم`,
  });

  steps.push({
    title: "۳) محدوده وزن نرمال فرد",
    formula: `بین ${formatRounded(minWeight)} تا ${formatRounded(maxWeight)} کیلوگرم`,
    result: `وزن فعلی فرد: ${formatRaw(weight)} کیلوگرم`,
  });

  let status: WeightStatus;
  if (weight < minWeight) status = "underweight";
  else if (weight > maxWeight) status = "overweight";
  else status = "normal";

  const genderLabel = gender === "male" ? "مرد" : "زن";
  let idealWeightRaw: number | undefined;
  let idealWeight: number | undefined;
  let adjustedWeight: number | undefined;
  let baseCalorie: number;
  let adjustment = 0;

  if (status === "normal") {
    baseCalorie = customRound(weight * 24 * 1.1 * activityCoefficient * genderFactor);
    steps.push({
      title: "۴) وضعیت وزن: نرمال",
      formula: `وزن (${formatRaw(weight)}) داخل محدوده [${formatRounded(minWeight)} , ${formatRounded(
        maxWeight
      )}] قرار دارد`,
      result: STATUS_LABELS.normal,
    });
    steps.push({
      title: "۵) محاسبه کالری مورد نیاز",
      formula: `${formatRaw(weight)} × 24 × 1.1 × ${activityCoefficient} × ${genderFactor} (${genderLabel})`,
      result: `${formatRounded(baseCalorie)} کیلوکالری`,
    });
  } else if (status === "underweight") {
    baseCalorie = customRound(weight * 24 * 1.1 * activityCoefficient * genderFactor);
    adjustment = 300;
    steps.push({
      title: "۴) وضعیت وزن: کمبود وزن (لاغر)",
      formula: `وزن (${formatRaw(weight)}) کمتر از کمینه محدوده (${formatRounded(minWeight)}) است`,
      result: STATUS_LABELS.underweight,
    });
    steps.push({
      title: "۵) محاسبه کالری پایه",
      formula: `${formatRaw(weight)} × 24 × 1.1 × ${activityCoefficient} × ${genderFactor} (${genderLabel})`,
      result: `${formatRounded(baseCalorie)} کیلوکالری`,
    });
    steps.push({
      title: "۶) افزودن ۳۰۰ کیلوکالری (جبران کمبود وزن)",
      formula: `${formatRounded(baseCalorie)} + 300`,
      result: `${formatRounded(customRound(baseCalorie + adjustment))} کیلوکالری`,
    });
  } else {
    idealWeightRaw = bmiIdealRaw;
    idealWeight = customRound(bmiIdealRaw * idealCoef);
    adjustedWeight = customRound((weight - idealWeight) / 4 + idealWeight);
    baseCalorie = customRound(adjustedWeight * 24 * 1.1 * activityCoefficient * genderFactor);
    adjustment = -500;

    steps.push({
      title: "۴) وضعیت وزن: اضافه وزن",
      formula: `وزن (${formatRaw(weight)}) بیشتر از بیشینه محدوده (${formatRounded(maxWeight)}) است`,
      result: STATUS_LABELS.overweight,
    });
    steps.push({
      title: "۵) محاسبه وزن ایده‌آل بر اساس BMI = 23",
      formula: `23 × (${heightM.toFixed(2)})² × ${idealCoef} = ${bmiIdealRaw.toFixed(2)} × ${idealCoef}`,
      result: `${formatRounded(idealWeight)} کیلوگرم`,
    });
    steps.push({
      title: "۶) محاسبه وزن تطبیق‌یافته",
      formula: `((${formatRaw(weight)} − ${formatRounded(idealWeight)}) ÷ 4) + ${formatRounded(idealWeight)}`,
      result: `${formatRounded(adjustedWeight)} کیلوگرم`,
    });
    steps.push({
      title: "۷) محاسبه کالری پایه با وزن تطبیق‌یافته",
      formula: `${formatRounded(adjustedWeight)} × 24 × 1.1 × ${activityCoefficient} × ${genderFactor} (${genderLabel})`,
      result: `${formatRounded(baseCalorie)} کیلوکالری`,
    });
    steps.push({
      title: "۸) کسر ۵۰۰ کیلوکالری (جهت کاهش وزن)",
      formula: `${formatRounded(baseCalorie)} − 500`,
      result: `${formatRounded(customRound(baseCalorie + adjustment))} کیلوکالری`,
    });
  }

  const finalCalorie = customRound(baseCalorie + adjustment);

  return {
    heightM,
    genderFactor,
    disabilityLabel,
    coefficientDescription,
    bmiMinRaw,
    bmiMaxRaw,
    minWeight,
    maxWeight,
    status,
    statusLabel: STATUS_LABELS[status],
    idealWeightRaw,
    idealWeight,
    adjustedWeight,
    baseCalorie,
    adjustment,
    finalCalorie,
    steps,
  };
}
