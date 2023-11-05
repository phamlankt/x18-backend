import { MongoFields } from "../../globals/fields/mongo.js";
import {
  ApplicantModel,
  ApplicationModel,
  JobModel,
  RecruiterModel,
} from "../../globals/mongodb.js";
import { applicantGetByUserId } from "./applicant.js";
import { getJobById } from "./jobs.js";
import { userGetAllDetailsById } from "./users.js";
import mongoose from "mongoose";

export const getAllApplication = async (req) => {
  const { id } = req.users;
  const existingUser = await userGetAllDetailsById(id);

  if (!existingUser) throw new Error("User Does not exist");

  if (existingUser.roleName !== "applicant")
    throw new Error("You must be an applicant to access this page.");

  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (currentPage - 1) * pageSize;

  const totalCounts = await ApplicationModel.countDocuments({
    applicantId: id,
  });
  const totalPages = Math.ceil(totalCounts / pageSize);
  const hasNext = currentPage < totalPages;
  // if (currentPage > totalPages)
  //   throw new Error(
  //     "Current page exceeds total pages. Please provide a valid page number"
  //   );

  const applications = await ApplicationModel.find({ applicantId: id })
    .limit(pageSize)
    .skip(offset);

  const applicationsWithJobs = [];

  for (const application of applications) {
    let job = await JobModel.findById(application.jobId).select(
      "-companyLogo"
    );
    if (!job) {
      const defaultJob = {
        _id: "6538b2235137f267553ad6ae",
        title: "Embedded Software Tester (From 3 Years Exp)",
        deadline: "2023-11-03T05:30:43.000Z",
        creator: "65290357dd680640c60dacc9",
        salary: "200-400",
        location: "Viet Nam",
        city: "ha-noi",
        position: "Junior",
        amount: 0,
        description:
          "<p><strong>JOB DESCRIPTION:</strong></p><ul><li>Engineering services for embedded software projects (C, Automotive)</li><li>Working with engineering team to make overall project proposal (work packages, time schedule...)</li><li>Supporting sales with quotation, pricing and contract with customer's supplier-Leading project team, execute project till final delivery to customer</li><li>Use PM tools for project management</li></ul><p><br></p><p><strong>JOB REQUIREMENTS:</strong></p><ul><li>B.S or Master degree in Mechatronic Engineering, Automotive Engineering, Electronics, Computing Engineering, Information Technology or related fields</li><li>Should possess strong knowledge and at least 3 years of experience in Project Management, Risk Management Good at stakeholder management skills</li><li>English proficiency is a must</li><li>Have strong experience in Embedded software development</li><li>Excellent analytical and problem-solving skills</li><li>Familiarity with software configuration management tools, defect tracking tools, and peer review</li><li>Have hands-on experience in Automotive Diagnostics and Communication protocols is big advantage</li><li>PMQ/PMP certificate is preferred</li></ul>",
        sectors: ["IT"],
        status: "open",
        createdAt: "2023-10-25T06:13:55.994Z",
        updatedAt: "2023-10-25T06:13:55.994Z",
      };
      job = defaultJob;
    }

    let recruiter = await RecruiterModel.findOne({ userId: job.creator });
    if (!recruiter) {
      const defaultRecruiter = {
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDtSOMvaiqRFbGBefTjHzL6PMSaQ7EvdYOTg&usqp=CAU",
      };
      recruiter = defaultRecruiter;
    }

    const applicationWithJob = {
      ...application._doc,
      job: job,
      companyLogoUrl: recruiter.companyLogoUrl,
    };

    applicationsWithJobs.push(applicationWithJob);
  }

  const result = {
    data: applicationsWithJobs,
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
  const { id } = req.users;
  const jobId = req.params.jobId;

  const existingUser = await userGetAllDetailsById(id);

  if (!existingUser) throw new Error("User Does not exist");

  if (existingUser.roleName !== "recruiter")
    throw new Error("You must be a recruiter to access this page.");

  const applications = await ApplicationModel.find({ jobId: jobId });

  if (!applications) throw new Error("No application found");

  const updatedApplications = await Promise.all(
    applications.map(async (application) => {
      const applicant = await ApplicantModel.findOne({
        userId: application.applicantId,
      });
      if (applicant) {
        return {
          ...application._doc,
          applicantName: applicant.fullName,
        };
      }
      return application;
    })
  );

  return updatedApplications;
};

export const getApplicationByJobIdAndApplicantId = async (req) => {
  const { id } = req.users;
  const jobId = req.params.jobId;
  if (!mongoose.Types.ObjectId.isValid(jobId))
    throw new Error("JobId does not exist");
  const existingJob = getJobById(jobId);
  if (!existingJob) throw new Error("Job does not exist!");

  const existingUser = await userGetAllDetailsById(id);
  if (!existingUser) throw new Error("User does not exist");

  if (existingUser.roleName !== "applicant")
    throw new Error("You must be an applicant to get application!");

  const application = await ApplicationModel.findOne({
    [MongoFields.jobId]: jobId,
    [MongoFields.applicantId]: id,
  });

  // if (!application) throw new Error("Applicant did not apply to this job yet!");
  if (!application) return {}
  return application;
};

export const applicantsAndApplicationsByJobId = async (req) => {
  const { id } = req.users;
  const jobId = req.params.jobId;

  const existingUser = await userGetAllDetailsById(id);

  if (!existingUser) throw new Error("User Does not exist");

  if (existingUser.roleName !== "recruiter")
    throw new Error("You must be a recruiter to access this page.");

  const existingJob = await getJobById(jobId);
  if (!existingJob) throw new Error("Job does not exist");

  const totalCounts = await ApplicationModel.countDocuments({ jobId: jobId });
  if (!totalCounts) throw new Error("No application found");

  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (currentPage - 1) * pageSize;
  const totalPages = Math.ceil(totalCounts / pageSize);
  const hasNext = currentPage < totalPages;

  const applications = await ApplicationModel.find({ jobId: jobId })
    .limit(pageSize)
    .skip(offset);

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
  const result = {
    data: combinedData,
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

export const updateApplicationStatusById = async (data) => {
  const { applicationId, status } = data;
  const existingApplication = await getApplicationtById(applicationId);
  if (!existingApplication) throw new Error("Application does not exist!");
  if (status) existingApplication.status = status;

  return await existingApplication.save();
};

export const getApplicationtById = async (id) => {
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
