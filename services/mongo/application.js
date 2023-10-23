import { MongoFields } from "../../globals/fields/mongo.js";
import { ApplicantModel, ApplicationModel } from "../../globals/mongodb.js";

export const applicationGetAll = async (req) => {
  const { id, roleName } = req.users;
  if (roleName !== "applicant")
    throw new Error("You must be an applicant to access this page.");

  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (currentPage - 1) * pageSize;

  const totalCounts = await ApplicationModel.countDocuments({
    applicantId: id,
  });
  const totalPages = Math.ceil(totalCounts / pageSize);
  const hasNext = currentPage < totalPages;

  const appications = await ApplicationModel.find({ applicantId: id })
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

export const applicationGetOfJobId = async (req) => {
  const { id, roleName } = req.users;
  const jobId = req.params.jobId;

  if (!id) throw new Error("User does not exist.");

  if (roleName !== "recruiter")
    throw new Error("You must be a recruiter to access this page.");

  const applications = await ApplicationModel.find({ jobId: jobId });

  if (applications.length === 0) throw new Error("No posts found");

  return applications;
};

export const applicantsAndApplicationsByJobId = async (req) => {
  const { id, roleName } = req.users;
  const jobId = req.params.jobId;

  if (!id) throw new Error("User does not exist.");

  if (roleName !== "recruiter")
    throw new Error("You must be a recruiter to access this page.");

  const applications = await ApplicationModel.find({ jobId: jobId });

  const applicantIds = applications.map(
    (application) => application.applicantId
  );
  const applicants = await ApplicantModel.find({
    userId: { $in: applicantIds },
  });

  const combinedData = applications.map((application) => {
    const applicant = applicants.find(
      (a) => a.userId === application.applicantId
    );
    return {
      applicant,
      application,
    };
  });
  return combinedData;
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
