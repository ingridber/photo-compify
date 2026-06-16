import express from "express";
import cookieParser from "cookie-parser";
import { routerComps } from "./routes/competitions";
import imagesRoutes from "./routes/images";
import { routerProfile } from "./routes/profile";
import { routerUser } from "./routes/users";
import { authRouter } from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
import { RateLimit } from "./middleware/rateLimiter";
import { routerReport } from "./routes/report";
import cors from "cors";
import { submissionRouter } from "./routes/submissions";
import  notificationRouter  from "./routes/notificationRoutes"
import adminRouter from "./routes/admin";
import { doubleCsrfProtection, generateCsrfToken } from "./middleware/csrfMiddleware";

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true, 
}));
app.use(RateLimit);
app.use(cookieParser());
app.use(doubleCsrfProtection);

app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ token: generateCsrfToken(req, res) });
});

//routes
app.use('/api/v1/competitions', routerComps);
app.use('/api/v1/competitions/:competitionId/submissions', submissionRouter);
app.use('/api/v1/submissions', submissionRouter);
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/images", imagesRoutes);
app.use("/api/v1/user", routerProfile);
app.use("/api/v1/user", routerUser);
app.use("/api/v1/notifications", notificationRouter);
app.use('/api/v1/report', routerReport)

// Admin route
app.use("/api/v1/admin", adminRouter)

app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

app.use(errorHandler)

export { app };
