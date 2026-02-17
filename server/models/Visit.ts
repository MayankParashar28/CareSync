import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    date: Date;
    status: 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
    type: 'consultation' | 'follow-up' | 'emergency';
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VisitSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true, default: Date.now },
    status: {
        type: String,
        enum: ['checked-in', 'in-progress', 'completed', 'cancelled'],
        default: 'checked-in',
    },
    type: {
        type: String,
        enum: ['consultation', 'follow-up', 'emergency'],
        required: true, // or default to consultation
        default: 'consultation'
    },
    reason: { type: String },
}, {
    timestamps: true,
});

// Indexes for efficient queries
VisitSchema.index({ patient: 1, date: -1 });
VisitSchema.index({ doctor: 1, date: -1 });
VisitSchema.index({ date: -1 });

export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);
