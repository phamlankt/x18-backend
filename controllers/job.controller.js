import asyncHandler from "express-async-handler";
import { job_getByQuery } from "../services/mongo/jobs.js";

// Get all  jobs
const getAll = asyncHandler(async (req, res) => {});

const getByQuery = asyncHandler(async (req, res) => {
  const query = req.query;

  if (!query.currentPage || isNaN(query.currentPage) || query.currentPage < 1) {
    query.currentPage = 1;
  }
  if (!query.pageSize || isNaN(query.pageSize) || query.pageSize < 1) {
    query.pageSize = 0;
  }

  const jobList = await job_getByQuery(query);
  res.send(jobList);
});

const JobController = {
  getAll,
  getByQuery,
};

export default JobController;
