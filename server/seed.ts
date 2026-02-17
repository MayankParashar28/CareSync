
import { User, Doctor } from "./models";
import { connectDB } from "./mongodb";
import { hashPassword } from "./auth";

export async function seed() {
  console.log('🌱 Seeding database (MongoDB)...');

  try {
    await connectDB();

    // 1. Check for Admin
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (!existingAdmin) {
      console.log('Creating Admin User (admin@clinic.com)...');
      const hashedPassword = await hashPassword("admin123");
      await User.create({
        firebaseUid: 'admin-user-id',
        email: 'admin@clinic.com',
        displayName: 'Admin User',
        phoneNumber: '+1234567890',
        role: 'admin',
        password: hashedPassword,
        createdAt: new Date(),
      });
    } else {
      console.log('✅ Admin user exists');
    }

    // 2. Check for Dev Doctor
    const existingDoctor = await User.findOne({ role: 'doctor' });

    if (!existingDoctor) {
      console.log('Creating Doctor User (Dr. Smith)...');
      const hashedPassword = await hashPassword("doctor123");
      const docUser = await User.create({
        firebaseUid: 'doctor-user-id',
        email: 'doctor@clinic.com',
        displayName: 'Sarah Smith',
        phoneNumber: '+1987654321',
        role: 'doctor',
        password: hashedPassword,
        createdAt: new Date(),
      });

      // Create Doctor Profile
      await Doctor.create({
        user: docUser._id,
        specialization: 'Cardiology',
        qualifications: 'MD, PhD',
        experienceYears: 10,
        licenseNumber: 'MD12345',
        consultationFee: 150,
        availability: {
          "mon": [{ start: "09:00", end: "17:00" }],
          "tue": [{ start: "09:00", end: "17:00" }],
          "wed": [{ start: "09:00", end: "17:00" }],
          "thu": [{ start: "09:00", end: "17:00" }],
          "fri": [{ start: "09:00", end: "17:00" }]
        }
      });
    } else {
      console.log('✅ Doctor user exists');
    }

    console.log('🌱 Seeding complete.');
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
  }
}
