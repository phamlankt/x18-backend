import { MongoFields } from "../../globals/fields/mongo.js";
import {
  JobModel,
  RecruiterModel,
  ApplicationModel,
  UserModel,
} from "../../globals/mongodb.js";
import {
  checkIfUserExists,
  checkIfUserIsActive,
} from "../../utils/userUtils.js";
import { calculatePagination } from "../../utils/paginationUtils.js";
import { getUserById } from "./users.js";
import { roleGetById } from "./roles.js";
import mongoose from "mongoose";
import { sendMail } from "../Mail/mail.js";
export const getActiveJobByQuery = async (query) => {
  let { search, sectors, sortBy, sortField, currentPage, pageSize, location } =
    query;

  if (!currentPage || isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }
  if (!pageSize || isNaN(pageSize) || pageSize < 1) {
    pageSize = 10;
  }

  const offset = (currentPage - 1) * pageSize || 0;
  const sortFieldValue = sortField || "createdAt";
  let sortByValue = sortBy === "asc" && sortBy ? 1 : -1;
  let queryCondition = { status: { $in: ["open", "extended"] } };

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
        pageSize,
      },
    };
  }

  const jobs = await JobModel.find(queryCondition)
    .sort({ [sortFieldValue]: sortByValue })
    .limit(pageSize)
    .skip(offset);

  const creators = await RecruiterModel.find({
    userId: { $in: jobs.map((job) => job.creator) },
  });

  const jobsWithCreator = creators.length
    ? jobs.map((job) => {
        const creator = creators?.find((c) => c.userId === job.creator);
        return { ...job.toObject(), creator };
      })
    : jobs;

  const isNext = totalJobCount > offset + jobs.length;
  const pagination = {
    totalJobCount,
    isNext,
    offset,
    pageSize,
  };

  return { jobs: jobsWithCreator, pagination };
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
    jobQuery.creator = userID;
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

  const jobsWithApplicationsCount = await Promise.all(
    jobs.map(async (job) => {
      const allApplicationsCount = await ApplicationModel.countDocuments({
        jobId: job._id,
      });
      const validApplicationsCount = await ApplicationModel.countDocuments({
        jobId: job._id,
        status: { $in: ["confirmed", "sent"] },
      });

      return {
        ...job.toObject(),
        allApplicationsCount,
        validApplicationsCount,
      };
    })
  );

  return {
    data: jobsWithApplicationsCount,
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
    jobQuery.creator = userID;
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

export const createJob = async ({ data, userId }) => {
  if (
    !data.title ||
    !data.deadline ||
    !data.sectors ||
    !data.salary ||
    !data.location ||
    !data.city ||
    !data.position ||
    !data.description ||
    !data.amount
  ) {
    throw new Error("Missing required fields to create job");
  }

  const user = await getUserById(userId);
  if (!user) throw new Error("User does not exist!");
  if (user.status !== "active") throw new Error("User is inactive!");

  const role = await roleGetById(user.roleId);
  if (!role) throw new Error("Role does not exist!");
  if (role.name !== "recruiter")
    throw new Error("User must be a recruiter in order to create a job");

  data.creator = userId;
  data.deadline = new Date(data.deadline);
  data.amount = Number(data.amount) || 0;
  data.status = "open";

  const jobDoc = new JobModel(data);

  return await jobDoc.save();
};

export const getJobById = async (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("JobId does not exist");
  return await JobModel.findOne({ [MongoFields.id]: id });
};

export const removeJobById = async (data) => {
  const { jobId, status } = data;
  const existingJob = await getJobById(jobId);
  if (!existingJob) throw new Error("Job does not exist!");
  if (status) existingJob.status = status;

  return await existingJob.save();
};

export const updateJobById = async ({ jobId, updateData, userId }) => {
  const user = await getUserById(userId);
  if (!user) throw new Error("User does not exist!");
  if (user.status !== "active") throw new Error("User is inactive!");

  const role = await roleGetById(user.roleId);
  if (!role) throw new Error("Role does not exist!");

  if (role.name !== "recruiter")
    throw new Error(
      "User must be a recruiter in order to update their created job"
    );

  const currentJob = await getJobById(jobId);
  if (!currentJob) throw new Error("Job does not exist!");
  if (currentJob.creator !== userId)
    throw new Error(
      "User is not the owner of this job, hence is not allowed to update this job"
    );

  const existingJob = await getJobById(jobId);
  if (!existingJob) {
    throw new Error("Job does not exist!");
  }

  if (updateData.deadline) {
    updateData.deadline = new Date(updateData.deadline);
  }

  ///chưa cập nhập được, vì existingJob.hasOwnProperty(prop) luôn false
  for (const prop in updateData) {
    if (existingJob[prop] !== undefined) {
      existingJob[prop] = updateData[prop];
    }
  }

  return await existingJob.save();
};

export const getJobByUserIdAndQuery = async (query) => {
  let {
    userId,
    search,
    sectors,
    status,
    sortBy,
    sortField,
    currentPage,
    pageSize,
    location,
  } = query;

  if (!currentPage || isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }
  if (!pageSize || isNaN(pageSize) || pageSize < 1) {
    pageSize = 10;
  }

  const offset = (currentPage - 1) * pageSize || 0;
  const sortFieldValue = sortField || "createdAt";
  let sortByValue = sortBy === "asc" && sortBy ? 1 : -1;
  let queryCondition = {};

  if (userId) {
    queryCondition.creator = userId;
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
  if (status) {
    queryCondition.status = status;
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
        pageSize,
      },
    };
  }

  const jobs = await JobModel.find(queryCondition)
    .sort({ [sortFieldValue]: sortByValue })
    .limit(pageSize)
    .skip(offset);

  const creators = await RecruiterModel.find({
    userId: { $in: jobs.map((job) => job.creator) },
  });

  const jobsWithCreator = creators.length
    ? jobs.map((job) => {
        const creator = creators?.find((c) => c.userId === job.creator);
        return { ...job.toObject(), creator };
      })
    : jobs;

  const isNext = totalJobCount > offset + jobs.length;
  const pagination = {
    totalJobCount,
    isNext,
    offset,
    pageSize,
  };

  return { jobs: jobsWithCreator, pagination };
};

export const removeJobAndAddDescription = async (data) => {
  const { jobId, reason } = data;

  const existingJob = await JobModel.findOne({ [MongoFields.id]: jobId });
  if (!existingJob) throw new Error("Job does not exist!");

  existingJob.status = "removed";
  existingJob.removeDescription = reason;

  const jobInfo = await existingJob.save();

  const creator = await RecruiterModel.findOne({
    userId: jobInfo.creator,
  });

  if (!creator) {
    throw new Error("Creator does not exist!");
  }

  const userAccount = await UserModel.findOne({
    [MongoFields.id]: creator.userId,
  });
  if (!userAccount) {
    throw new Error("User does not exist!");
  }

  sendMail(
    userAccount.email,
    "Job Removed - JobStar",
    `Your job - ${jobInfo.title} has been removed. Reason: ${reason}`
  );

  const resInfo = {
    ...jobInfo.toObject(),
    creator,
  };

  return resInfo;
};
