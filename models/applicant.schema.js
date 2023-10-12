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
  phone_number: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  sectors: {
    type: Array,
    required: false,
  },
  decription: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});


export default ApplicantSchema;
