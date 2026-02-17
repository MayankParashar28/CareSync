import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    dateTime: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    type: 'consultation' | 'follow-up' | 'emergency';
    reason?: string;
    notes?: string;
    duration?: number; // in minutes
    reminderSent?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dateTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending',
    },
    type: {
        type: String,
        enum: ['consultation', 'follow-up', 'emergency'],
        required: true,
    },
    reason: { type: String },
    notes: { type: String },
    duration: { type: Number, default: 30 },
    reminderSent: { type: Boolean, default: false },
}, {
    timestamps: true,
});

// Indexes for efficient queries
AppointmentSchema.index({ patient: 1, dateTime: 1 });
AppointmentSchema.index({ doctor: 1, dateTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ dateTime: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
