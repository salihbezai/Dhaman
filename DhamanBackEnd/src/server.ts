const app = require("./app");
import connectDb from "./config/db";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 3000;


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_wilaya", (wilaya) => {
    socket.join(wilaya);
  });

  socket.on("confirmer_join", (confirmerId) => {
    socket.join(confirmerId);
    console.log(`confirmer ${confirmerId} joined`);
  });

  socket.on("disconnect", () => {
    console.log("Driver disconnected");
  });
});

//  Make 'io' accessible in your routes/controllers

app.set("socketio", io);

const startServer = async () => {
  try {
    await connectDb();

    server.listen(PORT, () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();
