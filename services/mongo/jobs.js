import { JobModel } from "../../globals/mongodb.js";

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
export const getAllJobs = async (req, res) => {
    const userRole = users.roleName;

  let jobQuery = {};

    if (userRole === 'recruiter') {
      jobQuery.recruiterId = req.userId;
    } else if (userRole === "admin") {
    } else {
      jobQuery = {status: { $in: ["open", "extended"] }
    }

    const jobs = await JobModel.find(jobQuery)
      .sort({ _id: -1 }) 
      .limit(pageSize)
      .skip(offset);

    const totalCount = await JobModel.countDocuments(jobQuery);
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = currentPage < totalPages;

    if (!jobs) {
        res.status(404).json({ message: "No jobs found" });
    
    } else {

    res.status(200).json({
      data: jobs,
      hasnext: hasNext,
      currentPage,
      pageSize,
      totalCounts: totalCount,
      totalPages,
    });
  } }
};

// Get active jobs: applicant, admin, recruiter 
export const getAllActiveJobs = async (req, res) => {
  const userRole = req.user?.roleName;
  let jobQuery = { status: { $in: ["open", "extended"] } };

  if (userRole === "recruiter") {
    jobQuery.recruiterId = req.user.userId;
  }

  const jobs = await JobModel.find(query)
    .sort({ _id: -1 })
    .limit(pageSize)
    .skip(offset);

  const totalCount = await JobModel.countDocuments(query);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = currentPage < totalPages;

  res.status(200).json({
    data: jobs,
    hasnext: hasNext,
    currentPage,
    pageSize,
    totalCounts: totalCount,
    totalPages,
  });
};