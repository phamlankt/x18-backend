import express from "express";
import ApplicationController from "../controllers/application.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";
import { validationMdw } from "../middlewares/validate.middleware.js";
import { applicationSchema } from "../validations/application.validation.js";
import { multipleUpload, uploadFile } from "../middlewares/multer.js";

const applicationRouter = express.Router();

applicationRouter.get("/all", jwtCheck, ApplicationController.getAll);
applicationRouter.get("/all/:jobId", jwtCheck, ApplicationController.getOfJobId);
applicationRouter.get("/applicant/:jobId", jwtCheck, ApplicationController.getApplicationByJobIdForApplicant);
applicationRouter.get("/applicants/:jobId", jwtCheck, ApplicationController.getApplicantsAndApplications);

applicationRouter.post(
  "/create",
  // validationMdw(applicationSchema),
  multipleUpload,
  jwtCheck,
  ApplicationController.create
);
applicationRouter.post("/cancel", jwtCheck, ApplicationController.cancel);
applicationRouter.post("/updatStatusByRecruiter", jwtCheck, ApplicationController.updatStatusByRecruiter);

export default applicationRouter;
