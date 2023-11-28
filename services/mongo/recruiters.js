import mongoose, { Mongoose } from "mongoose";
import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { RecruiterModel, UserModel } from "../../globals/mongodb.js";

export const recruiterCreate = async (data) => {
  const userDoc = new RecruiterModel(data);
  return await userDoc.save();
};

export const recruiterUpdateByUserId = async (data) => {
  const { userId } = data;
  delete data.id;
  const existingUser = await recruiterGetByUserId(userId);

  if (!existingUser) throw new Error("User does not exist");
  for (const prop in data) {
    existingUser[prop] = data[prop];
  }
  return await existingUser.save();
};

export const recruiterGetByUserId = async (userId) => {
  return await RecruiterModel.findOne({ [MongoFields.userId]: userId });
};
