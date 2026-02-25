import { z } from "zod";

const nullableString = z.string().nullable().optional();
const nullableDateString = z.string().datetime().nullable().optional();

export const userDTOSchema = z.object({
  id: z.string(),
  email: nullableString,
  phone: nullableString,
  firstName: nullableString,
  lastName: nullableString,
  profileImageUrl: nullableString,
  role: z.enum(["patient", "doctor", "admin", "receptionist"]).nullable().optional(),
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
});

export const patientDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateOfBirth: nullableDateString,
  gender: nullableString,
  contactNumber: nullableString,
  address: nullableString,
  medicalHistory: nullableString,
  bloodType: nullableString,
  allergies: nullableString,
  emergencyContact: z
    .object({
      name: z.string().nullable().optional(),
      relationship: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  user: userDTOSchema.optional(),
});

export const doctorDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  specialization: z.string(),
  qualifications: nullableString,
  experienceYears: z.number().nullable().optional(),
  availability: z.record(z.any()).nullable().optional(),
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  user: userDTOSchema.optional(),
});

export const appointmentDTOSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  dateTime: z.string().datetime(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
  type: z.enum(["consultation", "follow-up", "emergency"]),
  reason: nullableString,
  notes: nullableString,
  duration: z.number().nullable().optional(),
  reminderSent: z.boolean().nullable().optional(),
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  doctor: doctorDTOSchema.optional(),
  patient: patientDTOSchema.optional(),
});

export const medicalRecordDTOSchema = z.object({
  id: z.string(),
  appointmentId: nullableString,
  patientId: z.string(),
  doctorId: z.string(),
  symptoms: nullableString,
  diagnosis: z.string(),
  prescription: z.string(),
  notes: nullableString,
  vitalSigns: z
    .object({
      bloodPressure: nullableString,
      heartRate: z.number().nullable().optional(),
      temperature: z.number().nullable().optional(),
      weight: z.number().nullable().optional(),
      height: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  labResults: nullableString,
  followUpDate: nullableDateString,
  visitDate: nullableDateString,
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  doctor: doctorDTOSchema.optional(),
  patient: patientDTOSchema.optional(),
});

export const mediaFileDTOSchema = z.object({
  id: z.string(),
  recordId: nullableString,
  patientId: z.string(),
  publicId: nullableString,
  url: z.string(),
  secureUrl: nullableString,
  resourceType: nullableString,
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().nullable().optional(),
  mimeType: nullableString,
  description: nullableString,
  category: z.enum(["scan", "report", "prescription", "xray", "mri", "lab", "other"]).nullable().optional(),
  uploadedAt: nullableDateString,
});

export const visitDTOSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string().datetime(),
  status: z.enum(["checked-in", "in-progress", "completed", "cancelled"]),
  type: z.enum(["consultation", "follow-up", "emergency"]),
  reason: nullableString,
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  patient: patientDTOSchema.optional(),
});

export const paymentDTOSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  visitId: nullableString,
  appointmentId: nullableString,
  amount: z.number(),
  status: z.enum(["pending", "paid", "refunded"]),
  paymentMethod: z.enum(["cash", "card", "upi"]).nullable().optional(),
  paymentDate: nullableDateString,
  description: nullableString,
  createdAt: nullableDateString,
  updatedAt: nullableDateString,
  patient: patientDTOSchema.optional(),
});

export const createPatientInputSchema = patientDTOSchema.omit({
  id: true,
  user: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export const updatePatientInputSchema = createPatientInputSchema.partial();

export const createDoctorInputSchema = doctorDTOSchema.omit({
  id: true,
  user: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDoctorInputSchema = createDoctorInputSchema.partial();

export const createAppointmentInputSchema = appointmentDTOSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAppointmentStatusInputSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
});

export const createMedicalRecordInputSchema = medicalRecordDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  doctor: true,
});

export const createMediaFileInputSchema = mediaFileDTOSchema.omit({
  id: true,
  uploadedAt: true,
});

export const createVisitInputSchema = visitDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  patient: true,
});

export const updateVisitInputSchema = z.object({
  status: z.enum(["checked-in", "in-progress", "completed", "cancelled"]).optional(),
  doctorId: z.string().optional(),
});

export const createPaymentInputSchema = paymentDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  patient: true,
});

export const updatePaymentInputSchema = z.object({
  status: z.enum(["pending", "paid", "refunded"]).optional(),
  paymentMethod: z.enum(["cash", "card", "upi"]).optional(),
});

export type UserDTO = z.infer<typeof userDTOSchema>;
export type PatientDTO = z.infer<typeof patientDTOSchema>;
export type DoctorDTO = z.infer<typeof doctorDTOSchema>;
export type AppointmentDTO = z.infer<typeof appointmentDTOSchema>;
export type MedicalRecordDTO = z.infer<typeof medicalRecordDTOSchema>;
export type MediaFileDTO = z.infer<typeof mediaFileDTOSchema>;
export type VisitDTO = z.infer<typeof visitDTOSchema>;
export type PaymentDTO = z.infer<typeof paymentDTOSchema>;

export type CreatePatientRequest = z.infer<typeof createPatientInputSchema>;
export type UpdatePatientRequest = z.infer<typeof updatePatientInputSchema>;
export type CreateDoctorRequest = z.infer<typeof createDoctorInputSchema>;
export type UpdateDoctorRequest = z.infer<typeof updateDoctorInputSchema>;
export type CreateAppointmentRequest = z.infer<typeof createAppointmentInputSchema>;
export type UpdateAppointmentStatusRequest = z.infer<typeof updateAppointmentStatusInputSchema>;
export type CreateMedicalRecordRequest = z.infer<typeof createMedicalRecordInputSchema>;
export type CreateMediaFileRequest = z.infer<typeof createMediaFileInputSchema>;
export type CreateVisitRequest = z.infer<typeof createVisitInputSchema>;
export type UpdateVisitRequest = z.infer<typeof updateVisitInputSchema>;
export type CreatePaymentRequest = z.infer<typeof createPaymentInputSchema>;
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentInputSchema>;
