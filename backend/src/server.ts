import { app } from "./app";
import { connectDb } from "./config/db";

const PORT = process.env.PORT || 3000

async function start() {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}

start();
