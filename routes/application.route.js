import express from "express";
import ApplicationController from "../controllers/application.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";


const applicationRouter = express.Router();


applicationRouter.get("/all", jwtCheck, ApplicationController.getAll);


export default applicationRouter;
