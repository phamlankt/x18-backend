import asyncHandler from "express-async-handler";
import {
  getActiveJobByQuery,
  jobCreate,
  jobGetById,
  jobRemoveById,
  getAllActiveJobs,
  getAllJobs,
} from "../services/mongo/jobs.js";
import { ResponseFields } from "../globals/fields/response.js";
import { RESPONSE } from "../globals/api.js";
import { userGetById } from "../services/mongo/users.js";
import { roleGetById } from "../services/mongo/roles.js";

// Get all  jobs
const getAll = asyncHandler(async (req, res) => {
  const user = req.user;
  const allJobs = await getAllJobs(user);
  res.json(allJobs);
});

const getBySearchAndFilter = asyncHandler(async (req, res) => {
  const query = req.query;

  const jobList = await getActiveJobByQuery(query);
  res.send(RESPONSE({ [ResponseFields.jobList]: jobList }, "Successfully"));
});

const create = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      deadline,
      sectors,
      salary,
      location,
      city,
      position,
      amount,
      description,
    } = req.body;

    if (
      !title ||
      !deadline ||
      !sectors ||
      !salary ||
      !location ||
      !city ||
      !position ||
      !amount ||
      !description
    )
      throw new Error("Missing required fields");

    const { id } = req.users;

    const user = await userGetById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist!");
    if (role.name !== "recruiter")
      throw new Error("User must be a recruiter in order to create a job");

    const newJob = await jobCreate({
      title,
      deadline: new Date(deadline),
      creator: id,
      sectors,
      salary,
      location,
      city,
      position,
      amount: Number(amount),
      description,
      status: "open",
    });

    res.send(
      RESPONSE(
        {
          [ResponseFields.jobInfo]: newJob,
        },
        "Create new job successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(RESPONSE([], "Create job unsuccessful", e.errors, e.message));
  }
});

const updateJobById = asyncHandler (async (req, res) => {
  const user = req.user;
  const jobId  = req.params.jobId;
  const updateData = req.body;

  const validFields = ['title', 'deadline', 'sectors', 'salary', 'location', 'city', 'position', 'amount', 'description'];

  const missingFields = validFields.filter(field => !updateData.hasOwnProperty(field));
  if (missingFields.length > 0) {
    throw new Error(`Missing required field(s): ${missingFields.join(', ')}`);
  }

  for (const field in updateData) {
    if (!validFields.includes(field)) {
      throw new Error(`${field} is not a valid field`);
    }
  }

  try {
    const updatedJob = await updateJobById(jobId, updateData);

    res.send({
      message: 'Job updated successfully',
      data: updatedJob,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Job update unsuccessful',
      error: error.message,
    });
  }
});

const remove = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) throw new Error("Missing required fields");
    const { id } = req.users;

    const user = await userGetById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist!");

    if (role.name !== "recruiter")
      throw new Error(
        "User must be a recruiter in order to remove his/her created job"
      );

    const currentJob = await jobGetById(jobId);
    if (!currentJob) throw new Error("Job does not exist!");
    if (currentJob.creator !== id)
      throw new Error(
        "User is not the owner of this job, hence is not allowed to remove this job"
      );

    const removedJob = await jobRemoveById({
      jobId,
      status: "removed",
    });
    res.send(
      RESPONSE(
        {
          [ResponseFields.jobInfo]: removedJob,
        },
        "Remove job successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(RESPONSE([], "Remove job unsuccessful", e.errors, e.message));
  }
});

const getActiveJobs = asyncHandler(async (req, res) => {
  const user = req.user;
  const allActiveJobs = await getAllActiveJobs(user);
  res.json(allActiveJobs);
});

const JobController = {
  getAll,
  getBySearchAndFilter,
  getActiveJobs,
  create,
  remove,
  updateJobById
};

export default JobController;
