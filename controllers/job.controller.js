import asyncHandler from "express-async-handler";
import { job_getByQuery } from "../services/mongo/jobs.js";

// Get all  jobs
const getAll = asyncHandler(async (req, res) => {});

const getByQuery = asyncHandler(async (req, res) => {
  const query = req.query;

  const jobList = await job_getByQuery(query);
  res.send(jobList);
});

const JobController = {
  getAll,
  getByQuery,
};

export default JobController;
