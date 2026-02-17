
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User, Patient, Appointment, MedicalRecord, Doctor } from "../server/models";

async function run() {
    try {
        await connectDB();

        const email = "patient@clinic.com";
        console.log(`Updating data for ${email}...`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found!");
            process.exit(1);
        }

        // 1. Update User Phone
        user.phoneNumber = "+1234567890";
        await user.save();
        console.log("✅ User phone updated.");

        // 2. Update Patient Profile
        const patient = await Patient.findOne({ user: user._id });
        if (patient) {
            patient.contactNumber = "+1234567890";
            patient.allergies = "Peanuts, Penicillin";
            patient.medicalHistory = "Asthma (managed), extraction of wisdom teeth (2018)";
            patient.address = "123 Main St, Springfield, IL";
            await patient.save();
            console.log("✅ Patient profile enriched.");
        }

        // 3. Find a Doctor
        const doctorUser = await User.findOne({ email: "doctor@clinic.com" });
        let doctorId = null;
        if (doctorUser) {
            const doctor = await Doctor.findOne({ user: doctorUser._id });
            if (doctor) doctorId = doctor._id;
        }

        if (!doctorId) {
            console.log("⚠️ No doctor found (doctor@clinic.com), skipping appointment creation.");
        } else {
            // 4. Create Past Appointment
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);

            await Appointment.create({
                patient: patient?._id,
                doctor: doctorId,
                dateTime: pastDate,
                reason: "Regular Checkup",
                status: "completed",
                type: "consultation",
                notes: "Patient reported mild cough."
            });
            console.log("✅ Past appointment created.");

            // 5. Create Upcoming Appointment
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5);

            await Appointment.create({
                patient: patient?._id,
                doctor: doctorId,
                dateTime: futureDate,
                reason: "Follow-up",
                status: "confirmed",
                type: "follow-up"
            });
            console.log("✅ Upcoming appointment created.");

            // 6. Create Medical Record
            await MedicalRecord.create({
                patient: patient?._id,
                doctor: doctorId,
                visitDate: pastDate,
                diagnosis: "Acute Bronchitis",
                symptoms: "Cough, mild fever",
                prescription: "Amoxicillin 500mg, Rest",
                notes: "Advised plenty of fluids."
            });
            console.log("✅ Medical record created.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
