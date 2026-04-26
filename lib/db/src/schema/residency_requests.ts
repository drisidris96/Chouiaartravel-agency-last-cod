import { pgTable, serial, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const residencyRequestStatusEnum = pgEnum("residency_request_status", [
  "pending", "processing", "approved", "rejected", "cancelled",
]);

export const residencyRequestsTable = pgTable("residency_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date").notNull(),
  birthPlace: text("birth_place").notNull(),
  profession: text("profession").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  passportNumber: text("passport_number").notNull(),
  passportExpiryDate: date("passport_expiry_date").notNull(),
  country: text("country").notNull(),
  residencyType: text("residency_type").notNull().default("work"),
  durationYears: text("duration_years"),
  sponsorName: text("sponsor_name"),
  sponsorContact: text("sponsor_contact"),
  travelDate: date("travel_date"),
  notes: text("notes"),
  status: residencyRequestStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResidencyRequestSchema = createInsertSchema(residencyRequestsTable)
  .omit({ id: true, createdAt: true, status: true, adminNotes: true });
export type InsertResidencyRequest = z.infer<typeof insertResidencyRequestSchema>;
export type ResidencyRequest = typeof residencyRequestsTable.$inferSelect;
