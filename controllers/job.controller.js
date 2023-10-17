import asyncHandler from "express-async-handler";
import { job_getByQuery } from "../services/mongo/jobs.js";
import { getAllActiveJobs } from "../services/mongo/jobs.js";
import { getAllJobs } from "../services/mongo/jobs.js";


// Get all jobs
const getAll = asyncHandler(async (req, res) => {
    const allJobs = await getAllJobs(); 
    res.json(allJobs);
});

const getByQuery = asyncHandler(async (req, res) => {
  const query = req.query;

  const jobList = await job_getByQuery(query);
  res.send(jobList);
});

const getActiveJobs = asyncHandler(async (req, res) => {
  const allActiveJobs = await getAllActiveJobs(); 
  res.json(allActiveJobs);
});


const JobController = {
  getAll,
  getByQuery,
  getActiveJobs
};

export default JobController;
