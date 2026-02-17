import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    patient: mongoose.Types.ObjectId;
    visit?: mongoose.Types.ObjectId;
    appointment?: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'paid' | 'refunded';
    paymentMethod?: 'cash' | 'card' | 'upi';
    paymentDate?: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    visit: { type: Schema.Types.ObjectId, ref: 'Visit' },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi'],
    },
    paymentDate: { type: Date },
    description: { type: String },
}, {
    timestamps: true,
});

// Indexes for efficient queries
PaymentSchema.index({ patient: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
