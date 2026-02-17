
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User, Patient, Doctor } from "../server/models";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import mongoose from "mongoose";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function ensureUser(email: string, password: string, role: string, firstName: string, lastName: string) {
    let user = await User.findOne({ email });
    const hashedPassword = await hashPassword(password);

    if (!user) {
        console.log(`Creating ${role} user: ${email}`);
        user = await User.create({
            firebaseUid: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            email,
            password: hashedPassword,
            displayName: `${firstName} ${lastName}`,
            role,
            phoneNumber: ""
        });
    } else {
        console.log(`Updating ${role} user password: ${email}`);
        user.password = hashedPassword;
        user.role = role as any;
        user.displayName = `${firstName} ${lastName}`;
        await user.save();
    }

    // Ensure profile exists
    if (role === 'patient') {
        const patient = await Patient.findOne({ user: user._id });
        if (!patient) {
            console.log(`Creating patient profile for ${email}`);
            await Patient.create({
                user: user._id,
                contactNumber: "",
                dateOfBirth: new Date("1990-01-01"),
                gender: "female",
                address: "123 Main St",
                medicalHistory: "None"
            });
        }
    } else if (role === 'doctor') {
        const doctor = await Doctor.findOne({ user: user._id });
        if (!doctor) {
            console.log(`Creating doctor profile for ${email}`);
            await Doctor.create({
                user: user._id,
                specialization: "General Medicine",
                qualifications: "MBBS, MD",
                experienceYears: 5,
                consultationFee: 100,
                availability: {
                    "Monday": [{ start: "09:00", end: "17:00" }],
                    "Tuesday": [{ start: "09:00", end: "17:00" }],
                    "Wednesday": [{ start: "09:00", end: "17:00" }],
                    "Thursday": [{ start: "09:00", end: "17:00" }],
                    "Friday": [{ start: "09:00", end: "17:00" }]
                },
                biography: "Experienced doctor."
            });
        }
    }

    return user;
}

async function run() {
    try {
        console.log("Connecting to DB...");
        await connectDB();

        await ensureUser("admin@clinic.com", "admin123", "admin", "System", "Admin");
        await ensureUser("doctor@clinic.com", "doctor123", "doctor", "John", "Doe");
        await ensureUser("patient@clinic.com", "patient123", "patient", "Jane", "Smith");

        console.log("✅ All test users verified/created.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
