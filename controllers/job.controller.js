import asyncHandler from "express-async-handler";

// Get all  jobs
const getAll = asyncHandler(async (req, res) => {});

const JobController = {
  getAll,
};

export default JobController;
