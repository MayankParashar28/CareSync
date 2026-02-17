import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
    appointment?: mongoose.Types.ObjectId;
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    symptoms: string;
    diagnosis: string;
    prescription: string;
    notes?: string;
    vitalSigns?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        weight?: number;
        height?: number;
    };
    labResults?: string;
    followUpDate?: Date;
    visitDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MedicalRecordSchema: Schema = new Schema({
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    symptoms: { type: String },
    diagnosis: { type: String, required: true },
    prescription: { type: String, required: true },
    notes: { type: String },
    vitalSigns: {
        bloodPressure: { type: String },
        heartRate: { type: Number },
        temperature: { type: Number },
        weight: { type: Number },
        height: { type: Number },
    },
    labResults: { type: String },
    followUpDate: { type: Date },
    visitDate: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Indexes for efficient queries
MedicalRecordSchema.index({ patient: 1, visitDate: -1 });
MedicalRecordSchema.index({ doctor: 1, visitDate: -1 });
MedicalRecordSchema.index({ appointment: 1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
