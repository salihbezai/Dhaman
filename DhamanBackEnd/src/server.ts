const app = require("./app");
import connectDb from "./config/db";
import dotenv from "dotenv";
import { Server } from "socket.io"; // 1. Import Socket.io
import http from "http"; // 2. Import HTTP
import { Order } from "./models/Order";

dotenv.config();

const PORT = process.env.PORT || 3000;

// 3. Create the HTTP server using your Express app
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});



// 5. Setup Socket Connection Logic
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

// 6. Make 'io' accessible in your routes/controllers
// We attach it to the app so we can grab it anywhere
app.set("socketio", io);

const startServer = async () => {
  try {
    await connectDb();
    // 7. IMPORTANT: Listen via 'server', not 'app'
    server.listen(PORT, () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();
