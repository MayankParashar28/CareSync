
import mongoose from "mongoose";
import { User, Patient, Doctor, Appointment, MedicalRecord, MediaFile, Visit, Payment } from "./models";
import type {
  AppointmentDTO,
  CreateAppointmentRequest,
  CreateDoctorRequest,
  CreateMediaFileRequest,
  CreateMedicalRecordRequest,
  CreatePatientRequest,
  CreatePaymentRequest,
  CreateVisitRequest,
  DoctorDTO,
  MedicalRecordDTO,
  MediaFileDTO,
  PatientDTO,
  PaymentDTO,
  UpdateDoctorRequest,
  UpdatePatientRequest,
  UpdateVisitRequest,
  UpdatePaymentStatusRequest,
  UserDTO,
  VisitDTO,
} from "@shared/contracts";
import {
  fromAppointmentDTO,
  fromMedicalRecordDTO,
  fromMediaFileDTO,
  fromPaymentDTO,
  fromVisitDTO,
  toAppointmentDTO,
  toDoctorDTO,
  toMedicalRecordDTO,
  toMediaFileDTO,
  toPatientDTO,
  toPaymentDTO,
  toUserDTO,
  toVisitDTO,
} from "./mappers";

export interface IStorage {
  // Users
  getUser(id: string): Promise<UserDTO | undefined>;
  getUserByEmail(email: string): Promise<UserDTO | undefined>;
  getUserByEmailWithPassword(email: string): Promise<UserDTO & { password?: string } | undefined>;
  getUserByPhone(phone: string): Promise<UserDTO | undefined>;
  getUserByPhone(phone: string): Promise<UserDTO | undefined>;
  createUser(user: UserDTO & { password?: string }): Promise<UserDTO>;
  updateUser(id: string, user: Partial<UserDTO>): Promise<UserDTO>;
  listUsers(): Promise<UserDTO[]>;

  // Patients
  getPatient(id: string): Promise<PatientDTO | undefined>;
  getPatientByUserId(userId: string): Promise<PatientDTO | undefined>;
  createPatient(patient: CreatePatientRequest & { userId: string }): Promise<PatientDTO>;
  registerPatientByReception(data: { firstName: string, lastName: string, email: string, phoneNumber: string, dateOfBirth: string, gender: string, address?: string }): Promise<PatientDTO>;
  updatePatient(id: string, updates: UpdatePatientRequest): Promise<PatientDTO>;
  listPatients(query?: string): Promise<PatientDTO[]>;

  // Visits
  createVisit(visit: CreateVisitRequest): Promise<VisitDTO>;
  getVisit(id: string): Promise<VisitDTO | undefined>;
  listVisits(filter?: { date?: Date, doctorId?: string }): Promise<VisitDTO[]>;
  updateVisit(id: string, updates: UpdateVisitRequest): Promise<VisitDTO>;

  // Payments
  createPayment(payment: CreatePaymentRequest): Promise<PaymentDTO>;
  getPayment(id: string): Promise<PaymentDTO | undefined>;
  listPayments(filter?: { date?: Date }): Promise<PaymentDTO[]>;
  updatePayment(id: string, updates: UpdatePaymentStatusRequest): Promise<PaymentDTO>;

  // Doctors
  getDoctor(id: string): Promise<DoctorDTO | undefined>;
  getDoctorByUserId(userId: string): Promise<DoctorDTO | undefined>;
  listDoctors(): Promise<DoctorDTO[]>;
  createDoctor(doctor: CreateDoctorRequest & { userId: string }): Promise<DoctorDTO>;
  updateDoctor(id: string, updates: UpdateDoctorRequest): Promise<DoctorDTO>;

  // Appointments
  getAppointmentsForPatient(patientId: string): Promise<AppointmentDTO[]>;
  getAppointmentsForDoctor(doctorId: string): Promise<AppointmentDTO[]>;
  createAppointment(appointment: CreateAppointmentRequest): Promise<AppointmentDTO>;
  updateAppointmentStatus(id: string, status: string): Promise<AppointmentDTO>;
  getAllAppointments(): Promise<AppointmentDTO[]>;

  // Medical Records
  getMedicalRecordsForPatient(patientId: string): Promise<MedicalRecordDTO[]>;
  getMedicalRecordsByDoctor(doctorId: string): Promise<MedicalRecordDTO[]>;
  createMedicalRecord(record: CreateMedicalRecordRequest): Promise<MedicalRecordDTO>;
  getMedicalRecord(id: string): Promise<MedicalRecordDTO | undefined>;

  // Media Files
  createMediaFile(file: CreateMediaFileRequest): Promise<MediaFileDTO>;
  getMediaFilesForRecord(recordId: string): Promise<MediaFileDTO[]>;
  getMediaFilesForPatient(patientId: string): Promise<MediaFileDTO[]>;

  // Admin
  getAdminStats(): Promise<{
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
  }>;
}

const isObjectId = (value?: string | null) => !!value && mongoose.Types.ObjectId.isValid(value);

async function resolveUserDoc(identifier: string) {
  const byFirebaseUid = await User.findOne({ firebaseUid: identifier });
  if (byFirebaseUid) return byFirebaseUid;
  if (isObjectId(identifier)) {
    return User.findById(identifier);
  }
  return null;
}

async function resolveUserId(identifier: string) {
  const user = await resolveUserDoc(identifier);
  return user?._id;
}

export class MongoStorage implements IStorage {
  // Users
  // Auth calls this with Firebase UID from token
  async getUser(id: string): Promise<UserDTO | undefined> {
    const user = await resolveUserDoc(id);
    return toUserDTO(user);
  }

  async getUserByPhone(phone: string): Promise<UserDTO | undefined> {
    const user = await User.findOne({ phoneNumber: phone });
    return toUserDTO(user);
  }

  async getUserByEmail(email: string): Promise<UserDTO | undefined> {
    const user = await User.findOne({ email });
    return toUserDTO(user);
  }

  async getUserByEmailWithPassword(email: string): Promise<UserDTO & { password?: string } | undefined> {
    const user = await User.findOne({ email });
    if (!user) return undefined;
    // Return DTO + password for auth
    return { ...toUserDTO(user)!, password: user.password };
  }

  async createUser(user: UserDTO & { password?: string }): Promise<UserDTO> {
    console.log('📝 Creating User Payload:', JSON.stringify(user, null, 2));
    // We map the schema fields to Mongoose fields
    // Safe handling for email: if missing, generate a dummy one from phone or random ID
    const safeEmail = user.email || `${user.phone?.replace('+', '') || 'user-' + Date.now()}@placeholder.com`;

    const newUser = await User.create({
      firebaseUid: user.id,
      email: safeEmail,
      password: user.password,
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      phoneNumber: user.phone,
      role: user.role || "patient"
    });
    return toUserDTO(newUser)!;
  }

  async updateUser(id: string, updates: Partial<UserDTO>): Promise<UserDTO> {
    const updateData: any = {};
    if (updates.role) updateData.role = updates.role;
    if (updates.email) updateData.email = updates.email;

    const resolved = await resolveUserDoc(id);
    if (!resolved) {
      throw new Error("User not found");
    }

    const user = await User.findByIdAndUpdate(resolved._id, updateData, { new: true });
    return toUserDTO(user)!;
  }

  async listUsers(): Promise<UserDTO[]> {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(toUserDTO).filter(Boolean) as UserDTO[];
  }

  // Patients
  async getPatient(id: string): Promise<PatientDTO | undefined> {
    const patient = await Patient.findById(id).populate("user");
    return toPatientDTO(patient);
  }

  async getPatientByUserId(userId: string): Promise<PatientDTO | undefined> {
    console.log(`[Storage] getPatientByUserId: Resolving for ${userId}`);
    const user = await resolveUserDoc(userId);
    if (!user) {
      console.log(`[Storage] getPatientByUserId: User not found for ${userId}`);
      return undefined;
    }
    console.log(`[Storage] getPatientByUserId: User resolved ${user._id}, finding Patient...`);
    const patient = await Patient.findOne({ user: user._id }).populate("user");
    console.log(`[Storage] getPatientByUserId: Patient found: ${!!patient}`);
    return toPatientDTO(patient);
  }

  async createPatient(patient: CreatePatientRequest & { userId: string }): Promise<PatientDTO> {
    const userId = await resolveUserId(patient.userId);
    if (!userId) throw new Error("User not found");

    const newPatient = await Patient.create({ ...patient, user: userId });
    const populated = await newPatient.populate("user");
    return toPatientDTO(populated)!;
  }

  async registerPatientByReception(data: { firstName: string, lastName: string, email: string, phoneNumber: string, dateOfBirth: string, gender: string, address?: string }): Promise<PatientDTO> {
    // 1. Create User
    // For now, we generate a random password or just create the user doc. 
    // In a real app with Firebase, we'd use admin SDK to create the user.
    // Here we'll just create a helper user in MongoDB.
    const user = await User.create({
      email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: 'patient',
      // In a real scenario, we might set a flag 'needsPasswordReset' or send a welcome email.
    });

    // 2. Create Patient
    const patientData = {
      userId: user._id.toString(),
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      contactNumber: data.phoneNumber,
      address: data.address,
    };

    // We pass userId string, but Mongoose schema expects ref to User.
    // Actually our createPatient takes InsertPatient which has userId string.
    // But inside createPatient we do `User.findById(patient.userId)`.
    // So let's re-use `createPatient` or just duplicate logic to be safe if `createPatient` changes.
    // Actually, `createPatient` looks up user by ID.
    const newPatient = await Patient.create({
      ...patientData,
      user: user._id
    });

    const populated = await newPatient.populate("user");
    return toPatientDTO(populated)!;
  }

  async updatePatient(id: string, updates: UpdatePatientRequest): Promise<PatientDTO> {
    const updated = await Patient.findByIdAndUpdate(id, updates, { new: true }).populate("user");
    return toPatientDTO(updated)!;
  }

  async listPatients(query?: string): Promise<PatientDTO[]> {
    let filter: any = {};
    if (query) {
      // Find users matching query first
      const users = await User.find({
        $or: [
          { displayName: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      });
      const userIds = users.map(u => u._id);
      filter = { user: { $in: userIds } };
    }
    const patients = await Patient.find(filter).populate('user').limit(50);
    return patients.map(toPatientDTO).filter(Boolean) as PatientDTO[];
  }

  // Visits
  async createVisit(visit: CreateVisitRequest): Promise<VisitDTO> {
    const newVisit = await Visit.create(fromVisitDTO(visit));
    const populated = await newVisit.populate({ path: "patient", populate: { path: "user" } });
    return toVisitDTO(populated)!;
  }

  async getVisit(id: string): Promise<VisitDTO | undefined> {
    const visit = await Visit.findById(id).populate({ path: "patient", populate: { path: "user" } });
    return toVisitDTO(visit);
  }

  async listVisits(filter?: { date?: Date, doctorId?: string }): Promise<VisitDTO[]> {
    const query: any = {};
    if (filter?.date) {
      const start = new Date(filter.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
    if (filter?.doctorId) {
      query.doctor = filter.doctorId;
    }

    const visits = await Visit.find(query).populate({ path: 'patient', populate: { path: 'user' } }).sort({ date: -1 });
    return visits.map(toVisitDTO).filter(Boolean) as VisitDTO[];
  }

  async updateVisit(id: string, updates: UpdateVisitRequest): Promise<VisitDTO> {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.doctorId) updateData.doctor = updates.doctorId;

    const updated = await Visit.findByIdAndUpdate(id, updateData, { new: true }).populate({ path: "patient", populate: { path: "user" } });
    return toVisitDTO(updated)!;
  }

  // Payments
  async createPayment(payment: CreatePaymentRequest): Promise<PaymentDTO> {
    const newPayment = await Payment.create(fromPaymentDTO(payment));
    const populated = await newPayment.populate({ path: "patient", populate: { path: "user" } });
    return toPaymentDTO(populated)!;
  }

  async getPayment(id: string): Promise<PaymentDTO | undefined> {
    const payment = await Payment.findById(id).populate({ path: "patient", populate: { path: "user" } });
    return toPaymentDTO(payment);
  }

  async listPayments(filter?: { date?: Date }): Promise<PaymentDTO[]> {
    const query: any = {};
    if (filter?.date) {
      const start = new Date(filter.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }
    const payments = await Payment.find(query).populate({ path: 'patient', populate: { path: 'user' } }).sort({ createdAt: -1 });
    return payments.map(toPaymentDTO).filter(Boolean) as PaymentDTO[];
  }

  async updatePayment(id: string, updates: UpdatePaymentStatusRequest): Promise<PaymentDTO> {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.paymentMethod) updateData.paymentMethod = updates.paymentMethod;
    if (updates.status === 'paid' && !updates.paymentMethod) {
      updateData.paymentDate = new Date();
    }

    const updated = await Payment.findByIdAndUpdate(id, updateData, { new: true }).populate({ path: "patient", populate: { path: "user" } });
    return toPaymentDTO(updated)!;
  }

  // Doctors
  async getDoctor(id: string): Promise<DoctorDTO | undefined> {
    const doctor = await Doctor.findById(id).populate("user");
    return toDoctorDTO(doctor);
  }

  async getDoctorByUserId(userId: string): Promise<DoctorDTO | undefined> {
    const user = await resolveUserDoc(userId);
    if (!user) return undefined;
    const doctor = await Doctor.findOne({ user: user._id }).populate("user");
    return toDoctorDTO(doctor);
  }

  async listDoctors(): Promise<DoctorDTO[]> {
    const docs = await Doctor.find().populate("user");
    return docs.map(toDoctorDTO).filter(Boolean) as DoctorDTO[];
  }

  async createDoctor(doctor: CreateDoctorRequest & { userId: string }): Promise<DoctorDTO> {
    const userId = await resolveUserId(doctor.userId);
    if (!userId) throw new Error("User not found");
    const newDoc = await Doctor.create({ ...doctor, user: userId });
    const populated = await newDoc.populate("user");
    return toDoctorDTO(populated)!;
  }

  async updateDoctor(id: string, updates: UpdateDoctorRequest): Promise<DoctorDTO> {
    const updated = await Doctor.findByIdAndUpdate(id, updates, { new: true }).populate("user");
    return toDoctorDTO(updated)!;
  }

  // Appointments
  async getAppointmentsForPatient(patientId: string): Promise<AppointmentDTO[]> {
    const appointments = await Appointment.find({ patient: patientId })
      .populate({ path: "doctor", populate: { path: "user" } })
      .sort({ dateTime: -1 });
    return appointments.map(toAppointmentDTO).filter(Boolean) as AppointmentDTO[];
  }

  async getAppointmentsForDoctor(doctorId: string): Promise<AppointmentDTO[]> {
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate({ path: "patient", populate: { path: "user" } })
      .sort({ dateTime: -1 });
    return appointments.map(toAppointmentDTO).filter(Boolean) as AppointmentDTO[];
  }

  async createAppointment(appointment: CreateAppointmentRequest): Promise<AppointmentDTO> {
    const newApp = await Appointment.create(fromAppointmentDTO(appointment));
    return toAppointmentDTO(newApp)!;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<AppointmentDTO> {
    const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    return toAppointmentDTO(updated)!;
  }

  async getAllAppointments(): Promise<AppointmentDTO[]> {
    const appointments = await Appointment.find().sort({ dateTime: -1 });
    return appointments.map(toAppointmentDTO).filter(Boolean) as AppointmentDTO[];
  }

  // Medical Records
  async getMedicalRecordsForPatient(patientId: string): Promise<MedicalRecordDTO[]> {
    const records = await MedicalRecord.find({ patient: patientId })
      .populate({ path: "doctor", populate: { path: "user" } })
      .sort({ visitDate: -1 });
    return records.map(toMedicalRecordDTO).filter(Boolean) as MedicalRecordDTO[];
  }

  async getMedicalRecordsByDoctor(doctorId: string): Promise<MedicalRecordDTO[]> {
    const records = await MedicalRecord.find({ doctor: doctorId })
      .populate({ path: "patient", populate: { path: "user" } })
      .sort({ visitDate: -1 });
    return records.map(toMedicalRecordDTO).filter(Boolean) as MedicalRecordDTO[];
  }

  async createMedicalRecord(record: CreateMedicalRecordRequest): Promise<MedicalRecordDTO> {
    const newRecord = await MedicalRecord.create(fromMedicalRecordDTO(record));
    return toMedicalRecordDTO(newRecord)!;
  }

  async getMedicalRecord(id: string): Promise<MedicalRecordDTO | undefined> {
    const record = await MedicalRecord.findById(id);
    return toMedicalRecordDTO(record);
  }

  // Media Files
  async createMediaFile(file: CreateMediaFileRequest): Promise<MediaFileDTO> {
    const newFile = await MediaFile.create(fromMediaFileDTO(file));
    return toMediaFileDTO(newFile)!;
  }

  async getMediaFilesForRecord(recordId: string): Promise<MediaFileDTO[]> {
    const files = await MediaFile.find({ record: recordId });
    return files.map(toMediaFileDTO).filter(Boolean) as MediaFileDTO[];
  }

  async getMediaFilesForPatient(patientId: string): Promise<MediaFileDTO[]> {
    const files = await MediaFile.find({ patient: patientId }).sort({ uploadedAt: -1 });
    return files.map(toMediaFileDTO).filter(Boolean) as MediaFileDTO[];
  }

  // Admin
  async getAdminStats() {
    const patientsCount = await Patient.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayApptsCount = await Appointment.countDocuments({
      dateTime: { $gte: today, $lt: tomorrow }
    });

    return {
      totalPatients: patientsCount,
      totalDoctors: doctorsCount,
      totalAppointments: appointmentsCount,
      todayAppointments: todayApptsCount,
    };
  }
}

export const storage = new MongoStorage();
