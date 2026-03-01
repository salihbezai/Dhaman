const app = require("./app");
import connectDb from "./config/db";

import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async() => {
  try {
    await connectDb();
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
  } catch (error) {
    process.exit(1);
  }
};


startServer();
