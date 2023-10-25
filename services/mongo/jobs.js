import { MongoFields } from "../../globals/fields/mongo.js";
import { JobModel } from "../../globals/mongodb.js";
import {
  checkIfUserExists,
  checkIfUserIsActive,
} from "../../utils/userUtils.js";
import { calculatePagination } from "../../utils/paginationUtils.js";

export const getActiveJobByQuery = async (query) => {
  let { search, sectors, sortBy, sortField, currentPage, pageSize, location } =
    query;
  const offset = (currentPage - 1) * pageSize || 0;
  const sortFieldValue = sortField || "createdAt";
  let sortByValue = sortBy === "asc" && sortBy ? 1 : -1;
  let queryCondition = { status: { $in: ["open", "extended"] } };

  if (!currentPage || isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }
  if (!pageSize || isNaN(pageSize) || pageSize < 1) {
    pageSize = 0;
  }

  if (search) {
    queryCondition.title = { $regex: search, $options: "i" };
  }
  if (sectors) {
    const sectorsArray = sectors
      .split("%")
      .map((sector) => new RegExp(`^${sector}$`, "i"));

    queryCondition.sectors = {
      $elemMatch: {
        $in: sectorsArray,
      },
    };
  }
  if (location) {
    const locationArray = location
      .split("%")
      .map((location) => new RegExp(`^${location}$`, "i"));
    queryCondition.city = { $in: locationArray };
  }

  const totalJobCount = await JobModel.countDocuments(queryCondition);
  if (totalJobCount <= 0) {
    return {
      jobs: [],
      pagination: {
        totalJobCount,
        isNext: false,
        offset,
      },
    };
  }

  const jobs = await JobModel.find(queryCondition)
    .sort({ [sortFieldValue]: sortByValue })
    .limit(pageSize)
    .skip(offset);

  const isNext = totalJobCount > offset + jobs.length;
  const pagination = {
    totalJobCount,
    isNext,
    offset,
  };

  return { jobs, pagination };
};

//Get all jobs for loggin in users
export const getAllJobs = async (user, query, currentPage, pageSize) => {
  let { search, sectors, location, status } = query;
  const userID = user.id;
  const userRole = user.roleName;
  const userExists = checkIfUserExists(userID);
  if (!userExists) {
    throw new Error("User does not exist");
  }

  const userIsActive = checkIfUserIsActive(userID);
  if (!userIsActive) {
    throw new Error("User is not active");
  }

  if (userRole === "applicant") {
    throw new Error("Unauthorized");
  }

  let jobQuery = {};

  if (userRole === "recruiter") {
    jobQuery.recruiterId = user.userID;
  }

  if (search) {
    jobQuery.title = { $regex: search, $options: "i" };
  }

  if (status) {
    jobQuery.status = status;
  }

  if (location) {
    const locationArray = location
      .split("%")
      .map((location) => new RegExp(`^${location}$`, "i"));
    jobQuery.city = { $in: locationArray };
  }

  if (sectors) {
    const sectorsArray = sectors
      .split("%")
      .map((sector) => new RegExp(`^${sector}$`, "i"));

    jobQuery.sectors = {
      $elemMatch: {
        $in: sectorsArray,
      },
    };
  }

  currentPage = currentPage || 1;
  const offset = (currentPage - 1) * pageSize;

  const pagination = await calculatePagination(jobQuery, currentPage, pageSize);

  const jobs = await JobModel.find(jobQuery)
    .sort({ _id: -1 })
    .limit(pageSize)
    .skip(offset);

  return {
    data: jobs,
    hasnext: pagination.hasNext,
    currentPage,
    pageSize: pagination.pageSize,
    totalCounts: pagination.totalCount,
    totalPages: pagination.totalPages,
  };
};

// Get active jobs: applicant, admin, recruiter -- maybe not use
export const getAllActiveJobs = async (user, currentPage, pageSize) => {
  const userID = user.id;
  const userRole = user.roleName;
  const userExists = checkIfUserExists(userID);
  if (!userExists) {
    throw new Error("User does not exist");
  }
  const userIsActive = checkIfUserIsActive(userID);
  if (!userIsActive) {
    throw new Error("User is not active");
  }

  let jobQuery = { status: { $in: ["open", "extended"] } };

  if (userRole === "recruiter") {
    jobQuery.recruiterId = user.userID;
  }
  currentPage = currentPage || 1;
  const offset = (currentPage - 1) * pageSize;
  const pagination = await calculatePagination(jobQuery, currentPage, pageSize);

  const jobs = await JobModel.find(jobQuery)
    .sort({ _id: -1 })
    .limit(pageSize)
    .skip(offset);

  return {
    data: jobs,
    hasnext: pagination.hasNext,
    currentPage,
    pageSize: pagination.pageSize,
    totalCounts: pagination.totalCount,
    totalPages: pagination.totalPages,
  };
};

export const createJob = async (data) => {
  if (
    !data.title ||
    !data.deadline ||
    !data.creator ||
    !data.sectors ||
    !data.salary ||
    !data.location ||
    !data.city ||
    !data.position ||
    !data.description ||
    !data.companyLogo
  ) {
    throw new Error("Missing required fields to create job");
  }

  data.deadline = new Date(data.deadline);
  data.amount = Number(data.amount) || 0;
  data.status = "open";
  data.sectors = data.sectors.split(",");

  const jobDoc = new JobModel(data);

  return await jobDoc.save();
};

export const getJobById = async (id) => {
  return await JobModel.findOne({ [MongoFields.id]: id });
};

export const removeJobById = async (data) => {
  const { jobId, status } = data;
  const existingJob = await getJobById(jobId);
  if (!existingJob) throw new Error("Job does not exist!");
  if (status) existingJob.status = status;

  return await existingJob.save();
};

export const updateJobById = async (jobId, updateData) => {
  const existingJob = await getJobById(jobId);

  if (!existingJob) {
    throw new Error("Job does not exist!");
  }
  for (const prop in updateData) {
    if (updateData.hasOwnProperty(prop)) {
      existingJob[prop] = updateData[prop];
    }
  }

  return await existingJob.save();
};
