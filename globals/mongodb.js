import mongoose from "mongoose";
import RecruiterSchema from "../models/recruiter.schema.js";
import UserSchema from "../models/user.schema.js";
import BusinessSectorSchema from "../models/businessSector.schema.js";
import ApplicationSchema from "../models/application.schema.js";
import ApplicantSchema from "../models/applicant.schema.js";
import JobSchema from "../models/job.schema.js";
import RoleSchema from "../models/role.schema.js";
import AdminSchema from "../models/admin.schema.js";

const MONGO_URI = process.env.MONGO_URI;

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log(`Database is connected at ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const UserModel = mongoose.model("users", UserSchema);
const RoleModel = mongoose.model("roles", RoleSchema);
const RecruiterModel = mongoose.model("recruiters", RecruiterSchema);
const ApplicantModel = mongoose.model("applicants", ApplicantSchema);
const AdminModel = mongoose.model("admins", AdminSchema);
const JobModel = mongoose.model("jobs", JobSchema);
const ApplicationModel = mongoose.model("applications", ApplicationSchema);
const BusinessSectorModel = mongoose.model(
  "business_sectors",
  BusinessSectorSchema
);

export {
  connectToDatabase,
  UserModel,
  RoleModel,
  RecruiterModel,
  ApplicantModel,
  AdminModel,
  JobModel,
  ApplicationModel,
  BusinessSectorModel,
};
