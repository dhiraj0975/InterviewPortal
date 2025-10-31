import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interviewRoutes.js";
import errorHandler from "./middleware/errorHandler.js"; // 👈 import

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/interviews", interviewRoutes);


app.use(errorHandler);

export default app;
