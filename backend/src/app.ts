import express from "express";
import { routerComps } from "./routes/competitions";
import imagesRoutes from "./routes/images";
import { routerLogIn } from "./routes/login";

const app = express();

app.use(express.json());

//routes
app.use('/api/v1/competitions', routerComps);
app.use("/api/v1/images", imagesRoutes);
app.use('/api/v1/login', routerLogIn )

app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

export { app };
