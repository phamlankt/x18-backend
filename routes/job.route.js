import express from "express";

import JobController from "../controllers/job.controller.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";

const jobRouter = express.Router();

const acceptedQueryParams = [
  "search",
  "sectors",
  "sortBy",
  "sortField",
  "currentPage",
  "pageSize",
  "location",
];

jobRouter.get("/all", JobController.getAll);
jobRouter.post("/", JobController.create);
jobRouter.get(
  "/query",
  checkQuery(acceptedQueryParams),
  JobController.getBySearchAndFilter
);

export default jobRouter;
