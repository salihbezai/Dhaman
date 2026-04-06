import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: "*", 
  credentials: true
}));

import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import supervisorRoutes from "./routes/supervisorRoutes";
import driverRoutes from "./routes/driverRoutes";
import confirmerRoutes from "./routes/confirmerRoutes";
import userRoutes from "./routes/userRoutes";
dotenv.config();


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/driver",driverRoutes)
app.use("/api/confirmer", confirmerRoutes);

export default app;