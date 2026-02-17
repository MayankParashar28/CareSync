import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Extend user with role (optional, could be in metadata or separate table, doing separate profile tables is cleaner)
// We will assume the user role is determined by existence in patients or doctors table, or just a simple 'role' field if we could modify users, 
// but we can't easily modify users table from blueprint. 
// Let's create a `profiles` table or just imply it. 
// Actually, let's create a `user_roles` or just add `role` to `patients`/`doctors` existence.
// For simplicity, let's say a user creates a profile as either Patient or Doctor.

export const patients = pgTable("patients", {
  id: text("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  contactNumber: text("contact_number"),
  address: text("address"),
  medicalHistory: text("medical_history"), // Simple text for now
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialization: text("specialization").notNull(),
  qualifications: text("qualifications"),
  experienceYears: integer("experience_years"),
  availability: jsonb("availability"), // e.g. { "mon": ["09:00", "17:00"] }
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  dateTime: timestamp("date_time").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  type: text("type").notNull(), // consultation, follow-up
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id").references(() => appointments.id),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  diagnosis: text("diagnosis").notNull(),
  symptoms: text("symptoms"),
  prescription: text("prescription").notNull(),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  visitDate: timestamp("visit_date").defaultNow(),
});

export const mediaFiles = pgTable("media_files", {
  id: text("id").primaryKey(),
  recordId: text("record_id").references(() => medicalRecords.id), // Can be null if not linked to a specific record yet
  patientId: text("patient_id").notNull().references(() => patients.id), // Owner
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status").notNull().default("checked-in"), // checked-in, in-progress, completed, cancelled
  type: text("type").notNull(), // consultation, follow-up, emergency
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => patients.id),
  visitId: text("visit_id").references(() => visits.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  amount: integer("amount").notNull(), // stored in smallest currency unit (e.g. cents) or just raw number
  status: text("status").notNull().default("pending"), // pending, paid, refunded
  paymentMethod: text("payment_method"), // cash, card, upi
  paymentDate: timestamp("payment_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
  records: many(medicalRecords),
  files: many(mediaFiles),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  records: many(medicalRecords),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one, many }) => ({
  appointment: one(appointments, { fields: [medicalRecords.appointmentId], references: [appointments.id] }),
  patient: one(patients, { fields: [medicalRecords.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [medicalRecords.doctorId], references: [doctors.id] }),
  files: many(mediaFiles),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  record: one(medicalRecords, { fields: [mediaFiles.recordId], references: [medicalRecords.id] }),
  patient: one(patients, { fields: [mediaFiles.patientId], references: [patients.id] }),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, { fields: [visits.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [visits.doctorId], references: [doctors.id] }),
  payment: one(payments, { fields: [visits.id], references: [payments.visitId] }), // A visit can have one payment record linked
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  patient: one(patients, { fields: [payments.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [payments.visitId], references: [visits.id] }),
  appointment: one(appointments, { fields: [payments.appointmentId], references: [appointments.id] }),
}));

// === BASE SCHEMAS ===
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, status: true });
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true, visitDate: true });
export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({ id: true, uploadedAt: true });
export const insertVisitSchema = createInsertSchema(visits).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Patient = typeof patients.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Request types
export type CreatePatientRequest = InsertPatient;
export type UpdatePatientRequest = Partial<InsertPatient>;

export type CreateDoctorRequest = InsertDoctor;
export type UpdateDoctorRequest = Partial<InsertDoctor>;

export type CreateAppointmentRequest = InsertAppointment;
export type UpdateAppointmentStatusRequest = { status: string };

export type CreateMedicalRecordRequest = InsertMedicalRecord;

export type CreateMediaFileRequest = InsertMediaFile;

export type CreateVisitRequest = InsertVisit;
export type CreatePaymentRequest = InsertPayment;
export type UpdatePaymentStatusRequest = { status: string, paymentMethod?: string, paymentDate?: string };

// Types with relations for frontend
export type AppointmentWithDetails = Appointment & {
  patient: Patient & { user: typeof users.$inferSelect };
  doctor: Doctor & { user: typeof users.$inferSelect };
};

export type MedicalRecordWithDetails = MedicalRecord & {
  doctor: Doctor & { user: typeof users.$inferSelect };
  files: MediaFile[];
};
