import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
});


export default ApplicantSchema;
