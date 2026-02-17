import { z } from 'zod';
import {
  userDTOSchema,
  patientDTOSchema,
  doctorDTOSchema,
  appointmentDTOSchema,
  medicalRecordDTOSchema,
  mediaFileDTOSchema,
  visitDTOSchema,
  paymentDTOSchema,
  createPatientInputSchema,
  updatePatientInputSchema,
  createDoctorInputSchema,
  updateDoctorInputSchema,
  createAppointmentInputSchema,
  updateAppointmentStatusInputSchema,
  createMedicalRecordInputSchema,
  createMediaFileInputSchema,
  createVisitInputSchema,
  updateVisitInputSchema,
  createPaymentInputSchema,
  updatePaymentInputSchema,
} from './contracts';
export type { CreateAppointmentRequest } from './contracts';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  // === PATIENTS ===
  patients: {
    me: {
      method: 'GET' as const,
      path: '/api/patients/me',
      responses: {
        200: patientDTOSchema,
        404: errorSchemas.notFound, // Not registered as patient yet
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/patients',
      input: createPatientInputSchema, // userId comes from auth session
      responses: {
        201: patientDTOSchema,
        400: errorSchemas.validation,
      },
    },
    registerByReception: {
      method: 'POST' as const,
      path: '/api/patients/register-by-reception',
      input: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phoneNumber: z.string(),
        dateOfBirth: z.string(),
        gender: z.string(),
        address: z.string().optional(),
      }),
      responses: {
        201: patientDTOSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/patients/me',
      input: updatePatientInputSchema,
      responses: {
        200: patientDTOSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/patients/:id',
      responses: {
        200: patientDTOSchema,
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/patients',
      input: z.object({ query: z.string().optional() }).optional(),
      responses: {
        200: z.array(patientDTOSchema),
      },
    },
  },

  // === DOCTORS ===
  doctors: {
    me: {
      method: 'GET' as const,
      path: '/api/doctors/me',
      responses: {
        200: doctorDTOSchema,
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/doctors',
      responses: {
        200: z.array(doctorDTOSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/doctors',
      input: createDoctorInputSchema, // userId comes from auth session
      responses: {
        201: doctorDTOSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/doctors/me',
      input: updateDoctorInputSchema,
      responses: {
        200: doctorDTOSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/doctors/:id',
      responses: {
        200: doctorDTOSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // === APPOINTMENTS ===
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments', // Returns appointments for current user (patient or doctor)
      responses: {
        200: z.array(appointmentDTOSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/appointments',
      input: createAppointmentInputSchema,
      responses: {
        201: appointmentDTOSchema,
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/appointments/:id/status',
      input: updateAppointmentStatusInputSchema,
      responses: {
        200: appointmentDTOSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // === MEDICAL RECORDS ===
  medicalRecords: {
    list: {
      method: 'GET' as const,
      path: '/api/medical-records', // List for current patient or records created by current doctor
      input: z.object({ patientId: z.string().optional() }).optional(), // Doctor can filter by patient
      responses: {
        200: z.array(medicalRecordDTOSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/medical-records',
      input: createMedicalRecordInputSchema,
      responses: {
        201: medicalRecordDTOSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/medical-records/:id',
      responses: {
        200: medicalRecordDTOSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // === MEDIA FILES ===
  mediaFiles: {
    create: {
      method: 'POST' as const,
      path: '/api/media-files',
      input: createMediaFileInputSchema,
      responses: {
        201: mediaFileDTOSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/media-files',
      input: z.object({ patientId: z.string().optional(), recordId: z.string().optional() }).optional(),
      responses: {
        200: z.array(mediaFileDTOSchema),
      },
    },
  },

  // === VISITS ===
  visits: {
    create: {
      method: 'POST' as const,
      path: '/api/visits',
      input: createVisitInputSchema, // patientId, doctorId, type are required
      responses: {
        201: visitDTOSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/visits',
      input: z.object({ date: z.string().optional(), doctorId: z.string().optional() }).optional(),
      responses: {
        200: z.array(visitDTOSchema),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/visits/:id',
      input: updateVisitInputSchema,
      responses: {
        200: visitDTOSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // === PAYMENTS ===
  payments: {
    create: {
      method: 'POST' as const,
      path: '/api/payments',
      input: createPaymentInputSchema,
      responses: {
        201: paymentDTOSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/payments',
      input: z.object({ date: z.string().optional() }).optional(),
      responses: {
        200: z.array(paymentDTOSchema),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/payments/:id',
      input: updatePaymentInputSchema,
      responses: {
        200: paymentDTOSchema,
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
