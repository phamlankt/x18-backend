import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    documents: {
      type: Array,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    status: { 
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default ApplicationSchema;
