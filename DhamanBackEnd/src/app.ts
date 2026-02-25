import express from 'express'

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import dotenv from "dotenv";
import authRoutes from "../src/routes/authRoutes"

dotenv.config();

app.use("/api/auth", authRoutes);

module.exports = app;