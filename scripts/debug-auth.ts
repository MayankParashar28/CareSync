
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User } from "../server/models";
import { comparePassword, hashPassword } from "../server/auth";
import mongoose from "mongoose";

async function run() {
    try {
        console.log("Connecting to DB...");
        await connectDB();

        const email = "admin@clinic.com";
        const password = "admin123";

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found!");
            process.exit(1);
        }

        console.log("User found:", user.email);
        console.log("Stored Password Hash:", user.password);

        if (!user.password) {
            console.log("❌ Password is missing on user object!");
            process.exit(1);
        }

        console.log(`Testing comparison with '${password}'...`);
        const isMatch = await comparePassword(password, user.password);

        if (isMatch) {
            console.log("✅ Success! Password matches.");
        } else {
            console.log("❌ Failed! Password does NOT match.");

            // Debug: Try re-hashing
            console.log("Attempting to re-hash and update...");
            const newHash = await hashPassword(password);
            console.log("New Hash:", newHash);

            user.password = newHash;
            await user.save();
            console.log("✅ Updated user with new hash. Try logging in now.");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
