import express from 'express'

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import dotenv from "dotenv";
import authRoutes from "../src/routes/authRoutes"
import supervisorRoutes from "../src/routes/supervisorRoutes";
import driverRoutes from "../src/routes/driverRoutes";
import confirmerRoutes from "../src/routes/confirmerRoutes";
import userRoutes from "../src/routes/userRoutes";
dotenv.config();

// A temporary test route to trigger the popup
// app.get("/api/test-popup/:wilaya", (req, res) => {
//     console.log("runnn "+req.params.wilaya)
//   const io = req.app.get("socketio");
//   const { wilaya } = req.params;
//   const order = {
//     orderId: "TEST12345",
//     customerName: "Basile Test",
//     address: "Batna, Center City",
//     wilaya: wilaya,
//     deliveryPrice: 500,
//     earnings: 450,
//   }
//   io.to(wilaya).emit("NEW_ORDER_POPUP", 
//     order
//   );

//   res.send(`Sent test popup to drivers in ${wilaya}`);
// });
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/driver",driverRoutes)
app.use("/api/confirmer", confirmerRoutes);

module.exports = app;