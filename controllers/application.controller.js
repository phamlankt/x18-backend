import asyncHandler from "express-async-handler";

// Get all  applications
const getAll = asyncHandler(async (req, res) => {});

const ApplicationController = {
  getAll,
};

export default ApplicationController;
