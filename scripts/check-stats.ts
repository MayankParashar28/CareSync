
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User, Patient, Doctor, Appointment } from "../server/models";
import mongoose from "mongoose";

async function run() {
    try {
        console.log("Connecting to DB...");
        await connectDB();

        console.log("Checking counts...");
        const users = await User.countDocuments();
        const patients = await Patient.countDocuments();
        const doctors = await Doctor.countDocuments();
        const appointments = await Appointment.countDocuments();

        console.log(`Users: ${users}`);
        console.log(`Patients: ${patients}`);
        console.log(`Doctors: ${doctors}`);
        console.log(`Appointments: ${appointments}`);

        const allUsers = await User.find({}, 'email role');
        console.log("All Users:", JSON.stringify(allUsers, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
