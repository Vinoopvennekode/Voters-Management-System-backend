import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import voterRoutes from "./routes/voterRoutes.js";
import masterRoutes from "./routes/masterRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/voters", voterRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.send("Voter Management API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
