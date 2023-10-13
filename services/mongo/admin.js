import mongoose, { Mongoose } from "mongoose";
import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { AdminModel, UserModel } from "../../globals/mongodb.js";

export const admin_create = async (data) => {
  const { userId, fullName, phoneNumber,avatarUrl } = data;

  const userDoc = new AdminModel({
    userId: userId,
    fullName: fullName,
    phoneNumber: phoneNumber,
    avatarUrl: avatarUrl,
  });

  return await userDoc.save();
};

export const admin_updateByUserId = async (data) => {
  const { userId, fullName, phoneNumber, avatarUrl } = data;

  const existingUser = await admin_getByUserId(userId);

  if (!existingUser) throw new Error("User not already exist");

  if (fullName) {
    existingUser.fullName = fullName;
  }

  if (phoneNumber) {
    existingUser.phoneNumber = phoneNumber;
  }

  if (avatarUrl) {
    existingUser.avatarUrl = avatarUrl;
  }

  return await existingUser.save();
};

export const admin_getByUserId = async (userId) => {
  return await AdminModel.findOne({ [MongoFields.userId]: userId });
};
