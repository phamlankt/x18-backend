import asyncHandler from "express-async-handler";
import {
  getActiveJobByQuery,
  jobCreate,
  jobGetById,
  jobRemoveById,
} from "../services/mongo/jobs.js";
import { ResponseFields } from "../globals/fields/response.js";
import { RESPONSE } from "../globals/api.js";
import { userGetById } from "../services/mongo/users.js";
import { roleGetById } from "../services/mongo/roles.js";

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
    if(!role) throw new Error("Role does not exist!")
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

const update = asyncHandler(async (req, res) => {});

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

// Get all jobs
const getAll = asyncHandler(async (req, res) => {
  const user = req.user;
  const allJobs = await getAllJobs(user);
  res.json(allJobs);;
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
  update,
  remove,
};

export default JobController; 

