import mongoose, { Schema, Document } from 'mongoose';

// User interface (for Firebase Auth integration)
export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    password?: string;
    role: 'patient' | 'doctor' | 'admin' | 'receptionist';
    createdAt: Date;
    lastLoginAt?: Date;
}

const UserSchema: Schema = new Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    phoneNumber: { type: String },
    password: { type: String }, // Optional to support existing users without password
    role: { type: String, enum: ['patient', 'doctor', 'admin', 'receptionist'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
});

export const User = mongoose.model<IUser>('User', UserSchema);
