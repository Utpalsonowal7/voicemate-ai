import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();


app.use(helmet());
app.use(express.json());
app.use(cors());

import healthRouter from "./routes/health.routes.js";
app.use("/api/v1/health", healthRouter);

export default app;