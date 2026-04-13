import express from "express";

const app = express();

app.use(express.json());

//routes

app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND", message: `the path ${req.path} was not found`
    });
});

export { app };
