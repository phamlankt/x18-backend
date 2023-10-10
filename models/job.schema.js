import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instock: {
    type: Number,
    required: true,
  },
});


export default JobSchema;
