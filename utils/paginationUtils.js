import { JobModel } from "../globals/mongodb.js";

export const calculatePagination = async (jobQuery, currentPage, providedPageSize = 10) => {
  const totalCount = await JobModel.countDocuments(jobQuery);
  const totalPages = Math.ceil(totalCount / providedPageSize);
  let pageSize;

  if (currentPage < totalPages) {
    pageSize = providedPageSize;
  } else {
    pageSize = totalCount % providedPageSize;
  }
  pageSize = Math.max(pageSize, 1);

  const hasNext = currentPage < totalPages;

  return { totalCount, totalPages, hasNext, pageSize };
};