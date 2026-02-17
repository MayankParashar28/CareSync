import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated, registerObjectStorageRoutes } from "./auth";
import { registerAdminRoutes } from "./routes/admin";
import { seed } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);
  registerAdminRoutes(app);

  // === PATIENTS ===
  app.get(api.patients.me.path, isAuthenticated, async (req: any, res) => {
    const patient = await storage.getPatientByUserId(req.user.claims.sub);
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    res.json(patient);
  });

  app.post(api.patients.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient({ ...input, userId: req.user.claims.sub });
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.patients.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user.claims.sub);
      if (!patient) return res.status(404).json({ message: "Patient profile not found" });

      const input = api.patients.update.input.parse(req.body);
      const updated = await storage.updatePatient(patient.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.patients.get.path, isAuthenticated, async (req, res) => {
    const patient = await storage.getPatient(String(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.get(api.patients.list.path, isAuthenticated, async (req: any, res) => {
    const query = req.query.query ? String(req.query.query) : undefined;
    const patients = await storage.listPatients(query);
    res.json(patients);
  });

  app.post(api.patients.registerByReception.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.patients.registerByReception.input.parse(req.body);
      const patient = await storage.registerPatientByReception(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === DOCTORS ===
  app.get(api.doctors.me.path, isAuthenticated, async (req: any, res) => {
    const doctor = await storage.getDoctorByUserId(req.user.claims.sub);
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  });

  app.get(api.doctors.list.path, isAuthenticated, async (req, res) => {
    const doctors = await storage.listDoctors();
    res.json(doctors);
  });

  app.post(api.doctors.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.doctors.create.input.parse(req.body);
      const doctor = await storage.createDoctor({ ...input, userId: req.user.claims.sub });
      res.status(201).json(doctor);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.doctors.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.claims.sub);
      if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

      const input = api.doctors.update.input.parse(req.body);
      const updated = await storage.updateDoctor(doctor.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.doctors.get.path, isAuthenticated, async (req, res) => {
    const doctor = await storage.getDoctor(String(req.params.id));
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    // TODO: Need to fetch user info for doctor (name etc) to make it consistent with list
    // For now assuming the basic doctor profile is requested, or handle it in storage to join
    res.json(doctor);
  });

  // === APPOINTMENTS ===
  app.get(api.appointments.list.path, isAuthenticated, async (req: any, res) => {
    // Check if patient or doctor
    const patient = await storage.getPatientByUserId(req.user.claims.sub);
    const doctor = await storage.getDoctorByUserId(req.user.claims.sub);

    let appointments = [];
    if (patient) {
      appointments = await storage.getAppointmentsForPatient(patient.id);
    } else if (doctor) {
      appointments = await storage.getAppointmentsForDoctor(doctor.id);
    } else {
      return res.status(400).json({ message: "Profile required" });
    }

    // Enrich appointments with names (ideally do this in SQL join)
    // For MVP doing simplified fetch. 
    // In a real app, use joins in storage layer.
    res.json(appointments);
  });

  app.post(api.appointments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      // Ensure the patient creating it is the one logged in, OR if doctor creates it??
      // Usually patient books.
      const patient = await storage.getPatientByUserId(req.user.claims.sub);
      if (!patient) return res.status(403).json({ message: "Only patients can book appointments" });

      const appointment = await storage.createAppointment({ ...input, patientId: patient.id });
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.appointments.updateStatus.path, isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const updated = await storage.updateAppointmentStatus(String(req.params.id), status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // === MEDICAL RECORDS ===
  app.get(api.medicalRecords.list.path, isAuthenticated, async (req: any, res) => {
    const patient = await storage.getPatientByUserId(req.user.claims.sub);
    const doctor = await storage.getDoctorByUserId(req.user.claims.sub);

    if (patient) {
      const records = await storage.getMedicalRecordsForPatient(patient.id);
      res.json(records);
    } else if (doctor) {
      const patientId = req.query.patientId ? String(req.query.patientId) : undefined;
      if (patientId) {
        const records = await storage.getMedicalRecordsForPatient(patientId);
        res.json(records);
      } else {
        const records = await storage.getMedicalRecordsByDoctor(doctor.id);
        res.json(records);
      }
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  });

  app.post(api.medicalRecords.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.medicalRecords.create.input.parse(req.body);
      const doctor = await storage.getDoctorByUserId(req.user.claims.sub);
      if (!doctor) return res.status(403).json({ message: "Only doctors can create records" });

      const record = await storage.createMedicalRecord({ ...input, doctorId: doctor.id });
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.medicalRecords.get.path, isAuthenticated, async (req: any, res) => {
    const record = await storage.getMedicalRecord(String(req.params.id));
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  });

  // === VISITS ===
  app.post(api.visits.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.visits.create.input.parse(req.body);
      const visit = await storage.createVisit(input);
      res.status(201).json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.visits.list.path, isAuthenticated, async (req: any, res) => {
    const date = req.query.date ? new Date(String(req.query.date)) : undefined;
    const doctorId = req.query.doctorId ? String(req.query.doctorId) : undefined;
    const visits = await storage.listVisits({ date, doctorId });
    res.json(visits);
  });

  app.patch(api.visits.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const { status, doctorId } = req.body;
      const updated = await storage.updateVisit(String(req.params.id), { status, doctorId });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update visit" });
    }
  });


  // === PAYMENTS ===
  app.post(api.payments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.payments.list.path, isAuthenticated, async (req: any, res) => {
    const date = req.query.date ? new Date(String(req.query.date)) : undefined;
    const payments = await storage.listPayments({ date });
    res.json(payments);
  });

  app.patch(api.payments.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const { status, paymentMethod } = req.body;
      const updated = await storage.updatePayment(String(req.params.id), { status, paymentMethod });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // === MEDIA FILES ===
  app.post(api.mediaFiles.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.mediaFiles.create.input.parse(req.body);
      const file = await storage.createMediaFile(input);
      res.status(201).json(file);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.get(api.mediaFiles.list.path, isAuthenticated, async (req: any, res) => {
    const recordId = req.query.recordId ? String(req.query.recordId) : undefined;
    const patientId = req.query.patientId ? String(req.query.patientId) : undefined;

    if (recordId) {
      const files = await storage.getMediaFilesForRecord(recordId);
      return res.json(files);
    }
    if (patientId) {
      const files = await storage.getMediaFilesForPatient(patientId);
      return res.json(files);
    }

    // Default to current user's files if patient
    const patient = await storage.getPatientByUserId(req.user.claims.sub);
    if (patient) {
      const files = await storage.getMediaFilesForPatient(patient.id);
      return res.json(files);
    }

    res.json([]);
  });

  if (process.env.NODE_ENV !== "production" || process.env.SEED_DATA === "true") {
    await seed();
  }
  return httpServer;
}
