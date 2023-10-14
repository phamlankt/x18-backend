import { MongoFields } from "../../globals/fields/mongo.js";
import {
  ApplicantModel,
} from "../../globals/mongodb.js";

export const applicant_create = async (data) => {
  const {
    userId,
    fullName,
    phoneNumber,
    age,
    gender,
    address,
    sectors,
    description,
    avatarUrl,
  } = data;

  const userDoc = new ApplicantModel({
    userId: userId,
    fullName: fullName,
    phoneNumber: phoneNumber,
    age: age,
    gender: gender,
    address: address,
    sectors: sectors,
    description: description,
    avatarUrl: avatarUrl,
  });

  return await userDoc.save();
};

export const applicant_updateByUserId = async (data) => {
  const {
    userId,
    fullName,
    phoneNumber,
    age,
    gender,
    address,
    sectors,
    description,
    avatarUrl,
  } = data;

  const existingUser = await applicant_getByUserId(userId);

  if (!existingUser) throw new Error("User does not exist");

  if (fullName) {
    existingUser.fullName = fullName;
  }

  if (phoneNumber) {
    existingUser.phoneNumber = phoneNumber;
  }
  if (age) {
    existingUser.age = age;
  }
  if (gender) {
    existingUser.gender = gender;
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

export const applicant_getByUserId = async (userId) => {
  return await ApplicantModel.findOne({ [MongoFields.userId]: userId });
};
