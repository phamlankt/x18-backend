import express from "express";
// import { authMiddleware } from "../middlewares/auth.middleware.js";
import ApplicationController from "../controllers/application.controller.js";


const applicationRouter = express.Router();

// applicationRouter.use(authMiddleware);

applicationRouter.get("/all", ApplicationController.getAll);


export default applicationRouter;
