import { JobModel } from "../../globals/mongodb.js";

export const job_getByQuery = async (query) => {
  const { search, sectors, sortBy, sortField, currentPage, pageSize } = query;

  const offset = (currentPage - 1) * pageSize;

  let queryCondition = { status: { $in: ["open", "extended"] } };
  if (search) {
    queryCondition.title = { $regex: search, $options: "i" };
  }
  if (sectors) {
    const sectorsArray = sectors
      .split("-")
      .map((sector) => new RegExp(`^${sector}$`, "i"));

    queryCondition.sectors = {
      $elemMatch: {
        $in: sectorsArray,
      },
    };
  }

  let sortByValue = -1; // default descending order
  if (sortBy === "asc") {
    sortByValue = 1;
  }
  const sortFieldValue = sortField || "createdAt";

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
