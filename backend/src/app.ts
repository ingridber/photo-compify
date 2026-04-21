import express from "express";
import cookieParser from "cookie-parser";
import { routerComps } from "./routes/competitions";
import imagesRoutes from "./routes/images";
import { routerProfile } from "./routes/profile";
import { authRouter } from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
import { RateLimit } from "./middleware/rateLimiter";
import cors from "cors";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(RateLimit);
app.use(cors({
    origin: 'http://localhost:5173', // Tillåt bara vår frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

//routes
app.use('/api/v1/competitions', routerComps);
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/images", imagesRoutes);
app.use("/api/v1/user", routerProfile);


app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

// ERROR HANDLELING FOR ALL ROUTES
app.use(errorHandler)

export { app };
