
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User, Patient } from "../server/models";

async function run() {
    try {
        await connectDB();

        const email = "patient@clinic.com";
        console.log(`Checking data for ${email}...`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found!");
            process.exit(1);
        }

        console.log("✅ User found:");
        console.log(JSON.stringify(user.toJSON(), null, 2));

        const patient = await Patient.findOne({ user: user._id }).populate('user');
        if (!patient) {
            console.log("❌ Patient profile not found!");
        } else {
            console.log("✅ Patient profile found:");
            console.log(JSON.stringify(patient.toJSON(), null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
