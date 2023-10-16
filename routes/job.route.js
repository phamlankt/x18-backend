import express from "express";

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

jobRouter.get("/all", JobController.getAll);
jobRouter.get("/query", checkQuery(queryParams), JobController.getByQuery);

export default jobRouter;
