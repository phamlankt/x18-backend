import asyncHandler from "express-async-handler";
import {
  applicantsAndApplicationsByJobId,
  applicationCancel,
  applicationCreate,
  applicationGetAll,
  applicationGetByApplicantIdAndJobId,
  applicationGetById,
  applicationGetOfJobId,
} from "../services/mongo/application.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { applicantCreate } from "../services/mongo/applicant.js";
import { userGetById } from "../services/mongo/users.js";
import { roleGetById } from "../services/mongo/roles.js";
import { jobGetById } from "../services/mongo/jobs.js";
import { MongoFields } from "../globals/fields/mongo.js";

// Get all  applications
const getAll = asyncHandler(async (req, res) => {
  try {
    const applications = await applicationGetAll(req);
    res.send(
      RESPONSE(
        {
          [ResponseFields.applicationList]: applications,
        },
        "Successfully"
      )
    );
  } catch (error) {
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
  } catch (error) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

// Get applicants and applications by jobId
const getApplicantsAndApplications = asyncHandler(async(req, res) => {
  try {
    const data = await applicantsAndApplicationsByJobId(req);
    res.json({
      data: data,
    });
  } catch (error) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
})

const create = asyncHandler(async (req, res) => {
  try {
    const { jobId, documents, note } = req.body;

    if (!jobId || !documents) throw new Error("Missing required fields");
    const { id } = req.users;

    const user = await userGetById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist");
    if (role.name !== "applicant")
      throw new Error("User must be an applicant in order to apply for a job");

    const job = await jobGetById(jobId);
    if (!job) throw new Error("Job does not exist");

    const application = await applicationGetByApplicantIdAndJobId(id, jobId);
    if (application) throw new Error("User applied to this job already!");

    const newApplication = await applicationCreate({
      applicantId: id,
      jobId,
      documents,
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

    const user = await userGetById(id);
    if (!user) throw new Error("User does not exist!");
    if (user.status !== "active") throw new Error("User is inactive!");

    const role = await roleGetById(user.roleId);
    if (!role) throw new Error("Role does not exist");
    if (role.name !== "applicant")
      throw new Error("User must be an applicant in order to cancel a job");

    const existingApplication = await applicationGetById(applicationId);
    if (!existingApplication) throw new Error("Application does not exist");
    if (existingApplication.applicantId !== id)
      throw new Error("User is not allowed to cancel this job!");

    const cancelledApplication = await applicationCancel({
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

const ApplicationController = {
  getAll,
  getOfJobId,
  create,
  cancel,
  getApplicantsAndApplications,
};

export default ApplicationController;
