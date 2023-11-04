import asyncHandler from "express-async-handler";
import {
  applicantsAndApplicationsByJobId,
  updateApplicationStatusById,
  applicationCreate,
  getAllApplication,
  applicationGetByApplicantIdAndJobId,
  getApplicationtById,
  applicationGetOfJobId,
  getApplicationByJobIdAndApplicantId,
} from "../services/mongo/application.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { applicantCreate } from "../services/mongo/applicant.js";
import { getUserById } from "../services/mongo/users.js";
import { roleGetById } from "../services/mongo/roles.js";
import { getJobById } from "../services/mongo/jobs.js";
import { MongoFields } from "../globals/fields/mongo.js";
import { uploadStream } from "../middlewares/multer.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Get all  applications
const getAll = asyncHandler(async (req, res) => {
  try {
    const applications = await getAllApplication(req);
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationList]: applications,
        },
        "Successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

// Get applications of jobId
const getOfJobId = asyncHandler(async (req, res) => {
  try {
    const applications = await applicationGetOfJobId(req);
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationList]: applications,
        },
        "Successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

// Get applicants and applications by jobId
const getApplicantsAndApplications = asyncHandler(async (req, res) => {
  try {
    const data = await applicantsAndApplicationsByJobId(req);
    res.json({
      data: data,
    });
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

const getApplicationByJobIdForApplicant = asyncHandler(async (req, res) => {
  try {
    const application = await getApplicationByJobIdAndApplicantId(req);
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationInfo]: application,
        },
        "Get application by JobId successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

const create = asyncHandler(async (req, res) => {
  try {
    const { jobId, documentNames, note } = req.body;
    const uploadedFiles = req.files;

    if (!jobId || uploadedFiles.length === 0 || documentNames.length === 0)
      throw new Error("Missing required fields");
    const { id } = req.users;

    const user = await getUserById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist");
    if (role.name !== "applicant")
      throw new Error("User must be an applicant in order to apply for a job");

    const job = await getJobById(jobId);
    if (!job) throw new Error("Job does not exist");

    const application = await applicationGetByApplicantIdAndJobId(id, jobId);
    if (application) throw new Error("User applied to this job already!");
    const uploadedDocuments = uploadedFiles.map((file) => {
      return cloudinary.uploader.upload(file.path, { folder: "x18-documents" });
    });

    await Promise.all(uploadedDocuments).then(async (values) => {
      uploadedFiles.map((file) => {
        fs.existsSync(file.path) && fs.unlinkSync(file.path);
      });
      const responseDocu = values.map((value, index) => {
        return {
          name: documentNames[index],
          path: value.url,
          fileName: value.original_filename,
        };
      });
      const newApplication = await applicationCreate({
        applicantId: id,
        jobId,
        documents: responseDocu,
        note,
        status: "sent",
      });
      res.send(
        RESPONSE(
          {
            [ResponseFields.applicationInfo]: newApplication,
          },
          "Create new application successfully"
        )
      );
    });
  } catch (e) {
    res
      .status(400)
      .send(
        RESPONSE([], "Create application unsuccessful", e.errors, e.message)
      );
  }
});

const cancel = asyncHandler(async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) throw new Error("Missing required fields");
    const { id } = req.users;

    const user = await getUserById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist");
    if (role.name !== "applicant")
      throw new Error(
        "User must be an applicant in order to cancel an application"
      );

    const existingApplication = await getApplicationtById(applicationId);
    if (!existingApplication) throw new Error("Application does not exist");
    if (existingApplication.applicantId !== id)
      throw new Error("User is not allowed to cancel this job!");

    const cancelledApplication = await updateApplicationStatusById({
      applicationId: applicationId,
      status: "cancelled",
    });
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationInfo]: cancelledApplication,
        },
        "Cancel application successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(
        RESPONSE([], "Cancel application unsuccessful", e.errors, e.message)
      );
  }
});

const updatStatusByRecruiter = asyncHandler(async (req, res) => {
  try {
    const { jobId, applicationId, status } = req.body;

    if (!jobId || !applicationId || !status)
      throw new Error("Missing required fields");
    const { id } = req.users;
    if (!["confirmed", "rejected"].includes(status))
      throw new Error("Application status is not correct!");
    const user = await getUserById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist");
    if (role.name !== "recruiter")
      throw new Error(
        "User must be a recruiter in order to confirm or reject a job"
      );

    const existingJob = await getJobById(jobId);
    if (!existingJob) throw new Error("Job does not exist");
    if (existingJob.creator !== id)
      throw new Error("Job is not created by this user");

    const existingApplication = await getApplicationtById(applicationId);
    if (!existingApplication) throw new Error("Application does not exist");
    if (existingApplication.jobId !== jobId)
      throw new Error("Could not find corresponding job for this application!");
    if (existingApplication.status !== "sent")
      throw new Error("Application is not in sent state!");

    const rejectedApplication = await updateApplicationStatusById({
      applicationId: applicationId,
      status: status,
    });
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationInfo]: rejectedApplication,
        },
        "Change application status successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(
        RESPONSE(
          [],
          "Change application status unsuccessful",
          e.errors,
          e.message
        )
      );
  }
});

const ApplicationController = {
  getAll,
  getOfJobId,
  create,
  cancel,
  updatStatusByRecruiter,
  getApplicantsAndApplications,
  getApplicationByJobIdForApplicant,
};

export default ApplicationController;
