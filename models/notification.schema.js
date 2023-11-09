import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recruiter: {
      type: String,
      required: true,
    },
    applicant: {
      type: String,
    },
    jobId: {
      type: String,
    },
    applicationId: {
      type: String,
    },
    status: {
      type: String,
    },
    read: {
      type: Boolean,
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default NotificationSchema;
