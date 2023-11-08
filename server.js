import "dotenv/config";
import express from "express";
import router from "./routes/index.js";
import { connectToDatabase } from "./globals/mongodb.js";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import {
  addNewUser,
  getUser,
  onlineUsers,
  removeUser,
} from "./controllers/socket.js";
import { createNotification } from "./services/mongo/notification.js";
import { getUserById } from "./services/mongo/users.js";

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

// const server = app.listen(PORT, function () {
//   console.log(`Listening on port ${PORT}`);
//   console.log(`http://localhost:${PORT}`);
// });

const handleListen = () => console.log(`Server is running at port ${PORT}`);

const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  // console.log('someone joined!')
  socket.on("newUser", ({ email, id }) => {
    console.log("email", email, id, socket.id);
    addNewUser(id, email, socket.id);
    console.log("onlineUsers", onlineUsers);
  });

  socket.on(
    "sendApplication",
    ({ email, jobId, applicationId, creator, status }) => {
      console.log(
        "sendApplication",
        email,
        jobId,
        applicationId,
        creator,
        status
      );
      // check if user is online then send notification
      const receiver = getUser(creator);
      console.log("onlineUsers", onlineUsers);
      console.log("receiver", receiver);

      receiver &&
        io.to(receiver.socketId).emit("getAppliedJobNotification", {
          email,
          jobId,
          status,
        });

      //save notification to DB
      getUserById(creator).then((existingRecruiter)=>{
        if (!existingRecruiter) throw new Error("Recruiter does not exist!");
        createNotification({
          recruiter: existingRecruiter.email,
          applicant: email,
          jobId: jobId,
          applicationId: applicationId,
          status,
          read: false,
        });
      })
     
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.socketId);
    console.log("user disconnected");
    console.log("onlineUsers", onlineUsers);
  });
});

httpServer.listen(PORT, handleListen);

// app.listen(PORT, () => {
//   console.log(`Server is running at PORT ${PORT}`);
// });
