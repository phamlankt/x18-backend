import "dotenv/config";
import express from "express";
import router from "./routes/index.js";
import { connectToDatabase } from "./globals/mongodb.js";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { handleSocketEvents } from "./controllers/socket.js";
import cron from "node-cron";
import { checkJobStatus } from "./services/bot/checkJobStatus.js";

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

cron.schedule("0 0 0 * * *", () => {
  checkJobStatus();
});

// 2. Global middlewares
app.use(express.json());
app.use(cors("*"));

// 3. Routing
app.use("/api/v1", router);

// 4. Error handling
app.use(errorHandlerMiddleware);

//5. Integrate a socket server
const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  handleSocketEvents(io, socket);
});

const handleListen = () => console.log(`Server is running at port ${PORT}`);
httpServer.listen(PORT, handleListen);
