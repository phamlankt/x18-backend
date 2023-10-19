import { MongoFields } from "../../globals/fields/mongo.js";
import { AdminModel, UserModel } from "../../globals/mongodb.js";

export const adminCreate = async (data) => {
  const { userId, fullName, phoneNumber,avatarUrl } = data;

  const userDoc = new AdminModel({
    userId: userId,
    fullName: fullName,
    phoneNumber: phoneNumber,
    avatarUrl: avatarUrl,
  });

  return await userDoc.save();
};

export const adminUpdateByUserId = async (data) => {
  const { userId, fullName, phoneNumber, avatarUrl } = data;

  const existingUser = await adminGetByUserId(userId);

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

export const adminGetByUserId = async (userId) => {
  return await AdminModel.findOne({ [MongoFields.userId]: userId });
};
