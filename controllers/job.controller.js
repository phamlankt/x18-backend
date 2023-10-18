import asyncHandler from "express-async-handler";
import { getActiveJobByQuery } from "../services/mongo/jobs.js";
import { ResponseFields } from "../globals/fields/response.js";
import { RESPONSE } from "../globals/api.js";

// Get all  jobs
const getAll = asyncHandler(async (req, res) => {});

const getBySearchAndFilter = asyncHandler(async (req, res) => {
  const query = req.query;

  const jobList = await getActiveJobByQuery(query);
  res.send(RESPONSE({ [ResponseFields.jobList]: jobList }, "Successfully"));
});

const JobController = {
  getAll,
  getBySearchAndFilter,
};

export default JobController;
