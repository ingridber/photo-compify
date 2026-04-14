import express from "express";
import cookieParser from "cookie-parser";
import { routerComps } from "./routes/competitions";
import { routerLogIn } from "./routes/login";
import { authRouter } from "./routes/auth";

const app = express();

app.use(express.json());
app.use(cookieParser());

//routes
app.use('/api/v1/competitions', routerComps);
app.use('/api/v1/login', routerLogIn);
app.use('/api/v1/auth', authRouter);

app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

export { app };
