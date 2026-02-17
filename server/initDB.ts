// Initialize MongoDB indexes and collections
import connectDB from './mongodb';
import { User, Patient, Doctor, Appointment, MedicalRecord, MediaFile } from './models';

export async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');

        // Connect to MongoDB
        await connectDB();

        // Create indexes for all models (ignore errors if index already exists)
        const indexPromises = [
            User.createIndexes().catch(err => console.log('  User indexes skipped (already exist)')),
            Patient.createIndexes().catch(err => console.log('  Patient indexes skipped (already exist)')),
            Doctor.createIndexes().catch(err => console.log('  Doctor indexes skipped (already exist)')),
            Appointment.createIndexes().catch(err => console.log('  Appointment indexes skipped (already exist)')),
            MedicalRecord.createIndexes().catch(err => console.log('  MedicalRecord indexes skipped (already exist)')),
            MediaFile.createIndexes().catch(err => console.log('  MediaFile indexes skipped (already exist)')),
        ];

        await Promise.all(indexPromises);

        console.log('✅ Database initialized');

        // Log collection stats
        const collections = await Promise.all([
            User.countDocuments(),
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            MedicalRecord.countDocuments(),
            MediaFile.countDocuments(),
        ]);

        console.log('📊 Collection stats:');
        console.log(`   Users: ${collections[0]}`);
        console.log(`   Patients: ${collections[1]}`);
        console.log(`   Doctors: ${collections[2]}`);
        console.log(`   Appointments: ${collections[3]}`);
        console.log(`   Medical Records: ${collections[4]}`);
        console.log(`   Media Files: ${collections[5]}`);

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}
