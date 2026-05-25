import { app } from "./app";
import { connectDb } from "./config/db";
import { initCompetitionPhases } from "./utils/competitions/initCompetitionPhases";

const PORT = process.env.PORT || 3000

async function start() {
    await connectDb().then(async () => {
        await initCompetitionPhases();
    });
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}

start();
