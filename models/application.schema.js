import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  item: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

export default ApplicationSchema;
