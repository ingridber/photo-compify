import express from "express";
import { routerComps } from "./routes/competitions";
import { routerUser } from "./routes/users";

const app = express();

app.use(express.json());

//routes
app.use('/api/v1/competitions', routerComps);
app.use(`/api/v1/user`, routerUser)

app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

export { app };
