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
});


export default RecruiterSchema;
