import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import JobController from "../controllers/job.controller.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";

const jobRouter = express.Router();

const queryParams = [
  "search",
  "sectors",
  "sortBy",
  "sortField",
  "currentPage",
  "pageSize",
  "location",
];

jobRouter.get("/", jwtCheck, JobController.getAll);
jobRouter.get("/query", checkQuery(queryParams), JobController.getByQuery);
jobRouter.get("/active", jwtCheck, JobController.getActiveJobs);

export default jobRouter;
