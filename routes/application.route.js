import express from "express";
import ApplicationController from "../controllers/application.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";
import { validationMdw } from "../middlewares/validate.middleware.js";
import { applicationSchema } from "../validations/application.validation.js";

const applicationRouter = express.Router();

applicationRouter.get("/all", jwtCheck, ApplicationController.getAll);
applicationRouter.post(
  "/create",
  validationMdw(applicationSchema),
  jwtCheck,
  ApplicationController.create
);
applicationRouter.post("/cancel", jwtCheck, ApplicationController.cancel);

export default applicationRouter;
