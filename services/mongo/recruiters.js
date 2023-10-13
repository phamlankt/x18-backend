import mongoose, { Mongoose } from "mongoose";
import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { RecruiterModel, UserModel } from "../../globals/mongodb.js";

export const recruiter_create = async (data) => {
  const { userId, companyName, phoneNumber, address, sectors, description,avatarUrl } =
    data;

  const userDoc = new RecruiterModel({
    userId: userId,
    companyName: companyName,
    phoneNumber: phoneNumber,
    address: address,
    sectors: sectors,
    description: description,
    avatarUrl:avatarUrl
  });

  return await userDoc.save();
};

export const recruiter_updateByUserId = async (data) => {
  const {
    userId,
    companyName,
    phoneNumber,
    address,
    sectors,
    description,
    avatarUrl,
  } = data;

  const existingUser = await recruiter_getByUserId(userId);

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

export const recruiter_getByUserId = async (userId) => {
  return await RecruiterModel.findOne({ [MongoFields.userId]: userId });
};