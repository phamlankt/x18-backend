import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: false,
  },
  phoneNumber: {
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
  description: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});


export default RecruiterSchema;
