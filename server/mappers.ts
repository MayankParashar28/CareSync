import type { Types } from "mongoose";
import type {
  AppointmentDTO,
  CreateAppointmentRequest,
  CreateMediaFileRequest,
  CreateMedicalRecordRequest,
  CreatePaymentRequest,
  CreateVisitRequest,
  DoctorDTO,
  MediaFileDTO,
  MedicalRecordDTO,
  PatientDTO,
  PaymentDTO,
  UserDTO,
  VisitDTO,
} from "@shared/contracts";

type AnyDoc = any;

const toId = (value: AnyDoc | Types.ObjectId | string | undefined | null): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof (value as any)._id === "object") return (value as any)._id.toString();
  if (typeof (value as any).toString === "function") return (value as any).toString();
  return undefined;
};

const splitName = (displayName?: string) => {
  if (!displayName) return { firstName: undefined, lastName: undefined };
  const parts = displayName.trim().split(" ");
  if (parts.length === 0) return { firstName: undefined, lastName: undefined };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") || undefined };
};

export const toUserDTO = (userDoc?: AnyDoc | null): UserDTO | undefined => {
  if (!userDoc) return undefined;
  const { firstName, lastName } = splitName(userDoc.displayName);
  return {
    id: userDoc.firebaseUid || toId(userDoc._id) || "",
    email: userDoc.email ?? null,
    phone: userDoc.phoneNumber ?? null,
    firstName: userDoc.firstName ?? firstName ?? null,
    lastName: userDoc.lastName ?? lastName ?? null,
    profileImageUrl: userDoc.profileImageUrl ?? null,
    role: userDoc.role ?? null,
    createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : null,
    updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt).toISOString() : null,
  };
};

export const toPatientDTO = (patientDoc?: AnyDoc | null): PatientDTO | undefined => {
  if (!patientDoc) return undefined;
  return {
    id: toId(patientDoc._id) || "",
    userId: patientDoc.user?.firebaseUid || toId(patientDoc.user) || "",
    dateOfBirth: patientDoc.dateOfBirth ? new Date(patientDoc.dateOfBirth).toISOString() : null,
    gender: patientDoc.gender ?? null,
    contactNumber: patientDoc.contactNumber ?? null,
    address: patientDoc.address ?? null,
    medicalHistory: patientDoc.medicalHistory ?? null,
    bloodType: patientDoc.bloodType ?? null,
    allergies: patientDoc.allergies ?? null,
    emergencyContact: patientDoc.emergencyContact ?? null,
    createdAt: patientDoc.createdAt ? new Date(patientDoc.createdAt).toISOString() : null,
    updatedAt: patientDoc.updatedAt ? new Date(patientDoc.updatedAt).toISOString() : null,
    user: toUserDTO(patientDoc.user),
  };
};

export const toDoctorDTO = (doctorDoc?: AnyDoc | null): DoctorDTO | undefined => {
  if (!doctorDoc) return undefined;
  return {
    id: toId(doctorDoc._id) || "",
    userId: doctorDoc.user?.firebaseUid || toId(doctorDoc.user) || "",
    specialization: doctorDoc.specialization,
    qualifications: doctorDoc.qualifications ?? null,
    experienceYears: doctorDoc.experienceYears ?? null,
    availability: doctorDoc.availability ?? null,
    createdAt: doctorDoc.createdAt ? new Date(doctorDoc.createdAt).toISOString() : null,
    updatedAt: doctorDoc.updatedAt ? new Date(doctorDoc.updatedAt).toISOString() : null,
    user: toUserDTO(doctorDoc.user),
  };
};

export const toAppointmentDTO = (appointmentDoc?: AnyDoc | null): AppointmentDTO | undefined => {
  if (!appointmentDoc) return undefined;
  return {
    id: toId(appointmentDoc._id) || "",
    patientId: toId(appointmentDoc.patient) || "",
    doctorId: toId(appointmentDoc.doctor) || "",
    dateTime: new Date(appointmentDoc.dateTime).toISOString(),
    status: appointmentDoc.status,
    type: appointmentDoc.type,
    reason: appointmentDoc.reason ?? null,
    notes: appointmentDoc.notes ?? null,
    duration: appointmentDoc.duration ?? null,
    reminderSent: appointmentDoc.reminderSent ?? null,
    createdAt: appointmentDoc.createdAt ? new Date(appointmentDoc.createdAt).toISOString() : null,
    updatedAt: appointmentDoc.updatedAt ? new Date(appointmentDoc.updatedAt).toISOString() : null,
    doctor: toDoctorDTO(appointmentDoc.doctor),
    patient: toPatientDTO(appointmentDoc.patient),
  };
};

export const toVisitDTO = (visitDoc?: AnyDoc | null): VisitDTO | undefined => {
  if (!visitDoc) return undefined;
  return {
    id: toId(visitDoc._id) || "",
    patientId: toId(visitDoc.patient) || "",
    doctorId: toId(visitDoc.doctor) || "",
    date: new Date(visitDoc.date).toISOString(),
    status: visitDoc.status,
    type: visitDoc.type,
    reason: visitDoc.reason ?? null,
    createdAt: visitDoc.createdAt ? new Date(visitDoc.createdAt).toISOString() : null,
    updatedAt: visitDoc.updatedAt ? new Date(visitDoc.updatedAt).toISOString() : null,
    patient: toPatientDTO(visitDoc.patient),
    doctor: toDoctorDTO(visitDoc.doctor),
  };
};

export const toPaymentDTO = (paymentDoc?: AnyDoc | null): PaymentDTO | undefined => {
  if (!paymentDoc) return undefined;
  return {
    id: toId(paymentDoc._id) || "",
    patientId: toId(paymentDoc.patient) || "",
    visitId: toId(paymentDoc.visit) ?? null,
    appointmentId: toId(paymentDoc.appointment) ?? null,
    amount: paymentDoc.amount,
    status: paymentDoc.status,
    paymentMethod: paymentDoc.paymentMethod ?? null,
    paymentDate: paymentDoc.paymentDate ? new Date(paymentDoc.paymentDate).toISOString() : null,
    description: paymentDoc.description ?? null,
    createdAt: paymentDoc.createdAt ? new Date(paymentDoc.createdAt).toISOString() : null,
    updatedAt: paymentDoc.updatedAt ? new Date(paymentDoc.updatedAt).toISOString() : null,
    patient: toPatientDTO(paymentDoc.patient),
  };
};

export const toMedicalRecordDTO = (recordDoc?: AnyDoc | null): MedicalRecordDTO | undefined => {
  if (!recordDoc) return undefined;
  return {
    id: toId(recordDoc._id) || "",
    appointmentId: toId(recordDoc.appointment) ?? null,
    patientId: toId(recordDoc.patient) || "",
    doctorId: toId(recordDoc.doctor) || "",
    symptoms: recordDoc.symptoms ?? null,
    diagnosis: recordDoc.diagnosis,
    prescription: recordDoc.prescription,
    notes: recordDoc.notes ?? null,
    vitalSigns: recordDoc.vitalSigns ?? null,
    labResults: recordDoc.labResults ?? null,
    followUpDate: recordDoc.followUpDate ? new Date(recordDoc.followUpDate).toISOString() : null,
    visitDate: recordDoc.visitDate ? new Date(recordDoc.visitDate).toISOString() : null,
    createdAt: recordDoc.createdAt ? new Date(recordDoc.createdAt).toISOString() : null,
    updatedAt: recordDoc.updatedAt ? new Date(recordDoc.updatedAt).toISOString() : null,
    doctor: toDoctorDTO(recordDoc.doctor),
    patient: toPatientDTO(recordDoc.patient),
  };
};

export const toMediaFileDTO = (fileDoc?: AnyDoc | null): MediaFileDTO | undefined => {
  if (!fileDoc) return undefined;
  return {
    id: toId(fileDoc._id) || "",
    recordId: toId(fileDoc.record) ?? null,
    patientId: toId(fileDoc.patient) || "",
    publicId: fileDoc.publicId ?? null,
    url: fileDoc.url,
    secureUrl: fileDoc.secureUrl ?? null,
    resourceType: fileDoc.resourceType ?? null,
    fileName: fileDoc.fileName,
    fileType: fileDoc.fileType,
    fileSize: fileDoc.fileSize ?? null,
    mimeType: fileDoc.mimeType ?? null,
    description: fileDoc.description ?? null,
    category: fileDoc.category ?? null,
    uploadedAt: fileDoc.uploadedAt ? new Date(fileDoc.uploadedAt).toISOString() : null,
  };
};

export const fromAppointmentDTO = (input: CreateAppointmentRequest) => ({
  patient: input.patientId,
  doctor: input.doctorId,
  dateTime: input.dateTime,
  status: (input as any).status,
  type: input.type,
  reason: input.reason ?? undefined,
  notes: input.notes ?? undefined,
  duration: input.duration ?? undefined,
  reminderSent: input.reminderSent ?? undefined,
});

export const fromVisitDTO = (input: CreateVisitRequest) => ({
  patient: input.patientId,
  doctor: input.doctorId,
  date: input.date,
  status: input.status,
  type: input.type,
  reason: input.reason ?? undefined,
});

export const fromMedicalRecordDTO = (input: CreateMedicalRecordRequest) => ({
  appointment: input.appointmentId ?? undefined,
  patient: input.patientId,
  doctor: input.doctorId,
  symptoms: input.symptoms ?? undefined,
  diagnosis: input.diagnosis,
  prescription: input.prescription,
  notes: input.notes ?? undefined,
  vitalSigns: input.vitalSigns ?? undefined,
  labResults: input.labResults ?? undefined,
  followUpDate: input.followUpDate ?? undefined,
  visitDate: input.visitDate ?? undefined,
});

export const fromMediaFileDTO = (input: CreateMediaFileRequest) => ({
  record: input.recordId ?? undefined,
  patient: input.patientId,
  publicId: input.publicId ?? undefined,
  url: input.url,
  secureUrl: input.secureUrl ?? undefined,
  resourceType: input.resourceType ?? undefined,
  fileName: input.fileName,
  fileType: input.fileType,
  fileSize: input.fileSize ?? undefined,
  mimeType: input.mimeType ?? undefined,
  description: input.description ?? undefined,
  category: input.category ?? undefined,
});

export const fromPaymentDTO = (input: CreatePaymentRequest) => ({
  patient: input.patientId,
  visit: input.visitId ?? undefined,
  appointment: input.appointmentId ?? undefined,
  amount: input.amount,
  status: input.status,
  paymentMethod: input.paymentMethod ?? undefined,
  paymentDate: input.paymentDate ?? undefined,
  description: input.description ?? undefined,
});
