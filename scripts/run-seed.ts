
import "dotenv/config";
import { seed } from "../server/seed";

seed().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
