import { ApplicationModel } from "../../globals/mongodb.js";

export const application_getAll = async (req) => {
  const { id, roleName } = req.users;
  if (roleName !== "applicant")
    throw new Error("You must be an applicant to access this page.");

  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (currentPage - 1) * pageSize;

  const totalCounts = await ApplicationModel.countDocuments({ userId: id });
  const totalPages = Math.ceil(totalCounts / pageSize);
  const hasNext = currentPage < totalPages;

  const appications = await ApplicationModel.find({ userId: id })
    .limit(pageSize)
    .skip(offset);

  const result = {
    data: appications,
    pagination: {
      currentPage,
      pageSize,
      totalCounts,
      totalPages,
      hasNext,
    },
  };

  return result;
};
