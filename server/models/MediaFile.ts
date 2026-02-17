import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaFile extends Document {
    record?: mongoose.Types.ObjectId;
    patient: mongoose.Types.ObjectId;
    publicId: string;
    url: string;
    secureUrl: string;
    resourceType: string;
    fileName: string;
    fileType: string;
    fileSize: number; // in bytes
    mimeType: string;
    description?: string;
    category?: 'scan' | 'report' | 'prescription' | 'xray' | 'mri' | 'lab' | 'other';
    uploadedAt: Date;
}

const MediaFileSchema: Schema = new Schema({
    record: { type: Schema.Types.ObjectId, ref: 'MedicalRecord' },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, default: 'image' },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['scan', 'report', 'prescription', 'xray', 'mri', 'lab', 'other'],
        default: 'other',
    },
    uploadedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
MediaFileSchema.index({ patient: 1, uploadedAt: -1 });
MediaFileSchema.index({ record: 1 });
MediaFileSchema.index({ category: 1 });

export const MediaFile = mongoose.model<IMediaFile>('MediaFile', MediaFileSchema);
