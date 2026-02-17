import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
    user: mongoose.Types.ObjectId;
    specialization: string;
    qualifications: string;
    experienceYears?: number;
    licenseNumber?: string;
    availability?: {
        [day: string]: { start: string; end: string }[];
    };
    consultationFee?: number;
    rating?: number;
    totalReviews?: number;
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    qualifications: { type: String, required: true },
    experienceYears: { type: Number },
    licenseNumber: { type: String },
    availability: {
        type: Map,
        of: [{
            start: { type: String },
            end: { type: String },
        }],
    },
    consultationFee: { type: Number },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Indexes for efficient queries
DoctorSchema.index({ user: 1 });
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ rating: -1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
