
import "dotenv/config";
import { connectDB } from "../server/mongodb";
import { User } from "../server/models";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import mongoose from "mongoose";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function run() {
    try {
        console.log("Connecting to DB...");
        await connectDB();

        const adminEmail = "admin@clinic.com";
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log("Admin user not found!");
            process.exit(1);
        }

        console.log(`Found admin user: ${user.email}`);

        const hashedPassword = await hashPassword("admin123");
        user.password = hashedPassword;
        await user.save();

        console.log("✅ Admin password updated to 'admin123'");

        // Close connection
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
