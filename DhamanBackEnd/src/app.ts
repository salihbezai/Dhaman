import express from 'express'

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import dotenv from "dotenv";
import authRoutes from "../src/routes/authRoutes"
import supervisorRoutes from "../src/routes/supervisorRoutes";
import driverRoutes from "../src/routes/driverRoutes";
import confirmerRoutes from "../src/routes/confirmerRoutes";
dotenv.config();

app.use("/api/auth", authRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/driver",driverRoutes)
app.use("/api/confirmer", confirmerRoutes);

module.exports = app;