import mongoose, { Mongoose } from "mongoose";
import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { RecruiterModel, UserModel } from "../../globals/mongodb.js";

export const recruiterCreate = async (data) => {
  const {
    userId,
    companyName,
    phoneNumber,
    address,
    sectors,
    description,
    avatarUrl,
  } = data;

  const userDoc = new RecruiterModel({
    userId: userId,
    companyName: companyName,
    phoneNumber: phoneNumber,
    address: address,
    sectors: sectors,
    description: description,
    avatarUrl: avatarUrl,
  });

  return await userDoc.save();
};

export const recruiterUpdateByUserId = async (data) => {
  const {
    userId,
    companyName,
    phoneNumber,
    address,
    sectors,
    description,
    avatarUrl,
  } = data;

  const existingUser = await recruiterGetByUserId(userId);

  if (!existingUser) throw new Error("User does not exist");

  if (companyName) {
    existingUser.companyName = companyName;
  }

  if (phoneNumber) {
    existingUser.phoneNumber = phoneNumber;
  }

  if (address) {
    existingUser.address = address;
  }
  if (phoneNumber) {
    existingUser.phoneNumber = phoneNumber;
  }

  if (sectors) {
    existingUser.sectors = sectors;
  }
  if (description) {
    existingUser.description = description;
  }

  if (avatarUrl) {
    existingUser.avatarUrl = avatarUrl;
  }

  return await existingUser.save();
};

export const recruiterGetByUserId = async (userId) => {
  return await RecruiterModel.findOne({ [MongoFields.userId]: userId });
};
