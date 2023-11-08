import "dotenv/config";
import express from "express";
import router from "./routes/index.js";
import { connectToDatabase } from "./globals/mongodb.js";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";
import { Server } from "socket.io";

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



// const io = new Server({
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

// io.on("connection", (socket) => {
//   // io.emit("firstEvent", "Hello this is test 2");
//   // io.emit("firstEvent", "Hello this is test 4");

//   socket.on("newUser", ({email, id}) => {
//     console.log("email", email, id, socket.id);
//     addNewUser(id, email, socket.id);
//   });

//   socket.on("sendApplication", ({ email, jobId, creator,status }) => {
//     console.log("sendApplication",email, jobId, creator,status)
//     const receiver = getUser(creator);
//     console.log("onlineUsers",onlineUsers)
//     console.log("receiver",receiver)
//     io.to(receiver.socketId).emit("getAppliedJobNotification", {
//       email,
//       jobId,
//       status
//     });
//   });

//   socket.on("sendNotification", ({ senderName, receiverName, type }) => {
//     const receiver = getUser(receiverName);
//     io.to(receiver.socketId).emit("getNotification", {
//       senderName,
//       type,
//     });
//   });

//   socket.on("sendText", ({ senderName, receiverName, text }) => {
//     const receiver = getUser(receiverName);
//     io.to(receiver.socketId).emit("getText", {
//       senderName,
//       text,
//     });
//   });

//   socket.on("disconnect", () => {
//     removeUser(socket.id);
//   });
// });
// // io.listen(5000);
// io.listen(5000, () => {
//   console.log(`Socket server is running at PORT 5000}`);
// });

// let onlineUsers = [];

// const addNewUser = (id, email, socketId) => {
//   !onlineUsers.some((user) => user.email === email) &&
//     onlineUsers.push({ id, email, socketId });
// };

// const removeUser = (socketId) => {
//   onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
// };

// const getUser = (id) => {
//   return onlineUsers.find((user) => user.id === id);
// };

