import { MongoFields } from "../../globals/fields/mongo.js";
import { ApplicationModel } from "../../globals/mongodb.js";

export const applicationGetAll = async (req) => {
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

export const applicationCreate = async (data) => {
  const { applicantId, jobId, documents, note, status } = data;

  const applicationDoc = new ApplicationModel({
    applicantId,
    jobId,
    documents,
    note,
    status,
  });

  return await applicationDoc.save();
};

export const applicationCancel = async (data) => {
  const { applicationId, status } = data;
  const existingApplication = await applicationGetById(applicationId);
  if (!existingApplication) throw new Error("Application does not exist!");
  if (status) existingApplication.status = status;

  return await existingApplication.save();
};

export const applicationGetById = async (id) => {
  return await ApplicationModel.findOne({ [MongoFields.id]: id });
};

export const applicationGetByApplicantIdAndJobId = async (
  applicantId,
  jobId
) => {
  return await ApplicationModel.findOne({
    [MongoFields.applicantId]: applicantId,
    [MongoFields.jobId]: jobId,
  });
};
