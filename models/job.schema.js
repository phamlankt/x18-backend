import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  creator: {
    type: Number,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  sectors: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  
});


export default JobSchema;
