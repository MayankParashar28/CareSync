import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
    user: mongoose.Types.ObjectId;
    dateOfBirth?: Date;
    gender?: string;
    contactNumber?: string;
    address?: string;
    medicalHistory?: string;
    bloodType?: string;
    allergies?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const PatientSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    contactNumber: { type: String },
    address: { type: String },
    medicalHistory: { type: String },
    bloodType: { type: String },
    allergies: { type: String },
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
    },
}, {
    timestamps: true,
});

// Index for efficient queries
PatientSchema.index({ user: 1 });

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
