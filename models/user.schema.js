import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_password_resetting: {
    type: Boolean,
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
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});


export default UserSchema;
