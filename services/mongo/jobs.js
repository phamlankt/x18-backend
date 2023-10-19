import { JobModel } from "../../globals/mongodb.js";

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
