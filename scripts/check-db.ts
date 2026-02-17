

import "dotenv/config";
import { db } from "../server/db";
import { users, patients, doctors } from "@shared/schema";
import { count } from "drizzle-orm";

async function main() {
    console.log("🔍 Checking Database Counts...");

    try {
        const [userCount] = await db.select({ count: count() }).from(users);
        console.log(`- Users: ${userCount.count}`);

        const [patientCount] = await db.select({ count: count() }).from(patients);
        console.log(`- Patients: ${patientCount.count}`);

        const [doctorCount] = await db.select({ count: count() }).from(doctors);
        console.log(`- Doctors: ${doctorCount.count}`);

    } catch (err) {
        console.error("❌ Error checking DB:", err);
    }
    process.exit(0);
}

main();
