import { JobModel } from "../../globals/mongodb.js";
import { checkIfUserExists, checkIfUserIsActive } from "../../utils/userUtils.js";
import { calculatePagination } from "../../utils/paginationUtils.js";

// Get active jobs for homepage + search job (users don't need to login)
export const job_getByQuery = async (query) => {
  const {
    search,
    sectors,
    sortBy,
    sortField,
    currentPage,
    pageSize,
    location,
  } = query;
  const offset = (currentPage - 1) * pageSize;
  const sortFieldValue = sortField || "createdAt";
  let sortByValue = sortBy === "asc" && sortBy ? 1 : -1;
  let queryCondition = { status: { $in: ["open", "extended"] } };

  if (!currentPage || isNaN(currentPage) || currentPage < 1) {
    query.currentPage = 1;
  }
  if (!pageSize || isNaN(pageSize) || pageSize < 1) {
    query.pageSize = 0;
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

  const jobs = await JobModel.find(queryCondition)
    .sort({ [sortFieldValue]: sortByValue })
    .limit(pageSize)
    .skip(offset);

  const totalJobCount = await JobModel.countDocuments(queryCondition);
  const isNext = totalJobCount > offset + jobs.length;

  const pagination = {
    totalJobCount,
    isNext,
    offset,
  };

  return { jobs, pagination };
};

//Get all jobs for loggin in users 
export const getAllJobs = async (user, currentPage, pageSize) => {
  const userID = user.id;
  const userRole = user.roleName;
  const userExists = checkIfUserExists(userID);
  const userIsActive = checkIfUserIsActive(userID);
  if (!userExists || !userIsActive) {
    throw new Error('User is not valid');
  }

  let jobQuery = {};

  switch (userRole) {
    case 'recruiter':
      jobQuery.recruiterId = userID;
      break;
    case 'admin':
      break;
    default:
      jobQuery = { status: { $in: ["open", "extended"] } }
      break;
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


// Get active jobs: applicant, admin, recruiter 
export const getAllActiveJobs = async (user, currentPage, pageSize) => {
  const userID = user.id;
  const userRole = user.roleName;
  const userExists = checkIfUserExists(userID);
  const userIsActive = checkIfUserIsActive(userID);
  if (!userExists || !userIsActive) {
    throw new Error('Unauthorized');
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