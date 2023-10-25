import express from "express";
import JobController from "../controllers/job.controller.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";
import { jobSchema } from "../validations/job.validation.js";
import {
  parseFormDataToBody,
  validationMdw,
} from "../middlewares/validate.middleware.js";
import { jwtCheck } from "../middlewares/jwt.js";
import { uploadFile } from "../middlewares/multer.js";

const jobRouter = express.Router();

const acceptedQueryParams = [
  "search",
  "sectors",
  "sortBy",
  "sortField",
  "currentPage",
  "pageSize",
  "location",
  "status",
];

jobRouter.get(
  "/user/query",
  jwtCheck,
  checkQuery(acceptedQueryParams),
  JobController.getAll
);

jobRouter.get("/details/:jobId", JobController.getById);
jobRouter.post(
  "/create",
  uploadFile.single("companyLogo"),
  parseFormDataToBody,
  validationMdw(jobSchema),
  jwtCheck,
  JobController.create
);
jobRouter.post("/remove", jwtCheck, JobController.remove);
jobRouter.get(
  "/query",
  checkQuery(acceptedQueryParams),
  JobController.getBySearchAndFilter
);
jobRouter.get("/active", jwtCheck, JobController.getActiveJobs);
jobRouter.put(
  "/:jobId",
  validationMdw(jobSchema),
  jwtCheck,
  JobController.update
);

export default jobRouter;
