import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import NotificationController from "../controllers/notification.controller.js";
import { checkUser } from "../middlewares/checkUser.middlewarae.js";

const notificationRouter = express.Router();

notificationRouter.get("/", jwtCheck, NotificationController.getByRecruiter);
notificationRouter.put("/update", jwtCheck,checkUser, NotificationController.update);

export default notificationRouter;
