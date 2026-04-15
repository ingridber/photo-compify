import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

export async function connectDb() {
    try {
        if (!MONGO_URI) throw new Error("No DB URI present");
        await mongoose.connect(MONGO_URI);
        if (!mongoose.connection.db) throw new Error("DB not connected");
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error(error);
        await mongoose.disconnect();
        process.exit(1);
    };
};
