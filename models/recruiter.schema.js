import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  company_name: {
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


export default RecruiterSchema;
