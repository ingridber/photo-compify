import { app } from "./app";
import { connectDb } from "./config/db";
import { startCompetitionScheduler } from "./utils/competitions/competitionScheduler";

const required = [
    "MONGO_URI",
    "PORT",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "NODE_ENV",
    "SUPABASE_URL",
    "SUPABASE_BUCKET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RECAPTCHA_SECRET",
    "RESEND_API_KEY",
    "SIGHTENGINE_USER",
    "SIGHTENGINE_SECRET",
    "CLIENT_URL"
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error("Missing env vars:", missing.join(", "));
    process.exit(1);
}

const PORT = process.env.PORT || 3000

async function start() {
    await connectDb().then(async () => {
        startCompetitionScheduler();
    });
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}

start();