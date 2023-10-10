import "dotenv/config";
import express from "express";
import router from "./routes/index.js";
import { connectToDatabase } from "./globals/mongodb.js";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";
const app = express();
const PORT = 3001;

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// 1. Create connection to database
connectToDatabase();

// 2. Global middlewares
app.use(express.json());
app.use(cors("*"));

// 3. Routing
app.use("/api/v1", router);

// 4. Error handling
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
