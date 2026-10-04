import { pgTable, serial, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  gender: text("gender").notNull(), // 'male' | 'female'
  weight: doublePrecision("weight").notNull(), // kg
  height: doublePrecision("height").notNull(), // cm
  activityCoefficient: doublePrecision("activity_coefficient").notNull(),
  disabilityType: text("disability_type").notNull(), // 'amputation' | 'paralysis'
  disabilityDetail: text("disability_detail").notNull(), // specific key
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
