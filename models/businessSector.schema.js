import mongoose from "mongoose";

const BusinessSectorSchema = new mongoose.Schema({
  BusinessSectorname: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default BusinessSectorSchema;
