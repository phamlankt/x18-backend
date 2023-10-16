import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import MailController from "../controllers/mail.controller.js";

const mailRouter = express.Router();

mailRouter.post("/send",  MailController.send);

export default mailRouter;
