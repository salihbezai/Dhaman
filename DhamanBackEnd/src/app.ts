import express from 'express'

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import dotenv from "dotenv";

dotenv.config();


module.exports = app;