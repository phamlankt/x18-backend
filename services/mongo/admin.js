import { MongoFields } from "../../globals/fields/mongo.js";
import { AdminModel, UserModel } from "../../globals/mongodb.js";

export const adminCreate = async (data) => {
  const { userId, fullName, phoneNumber, avatarUrl } = data;

  const userDoc = new AdminModel({
    userId: userId,
    fullName: fullName,
    phoneNumber: phoneNumber,
    avatarUrl: avatarUrl,
  });
  return await userDoc.save();
};

export const adminUpdateByUserId = async (data) => {
  const { userId } = data;
  delete data.id;

  const existingUser = await adminGetByUserId(userId);
  if (!existingUser) throw new Error("User not already exist");

  for (const prop in data) {
    existingUser[prop] = data[prop];
  }

  return await existingUser.save();
};

export const adminGetByUserId = async (userId) => {
  return await AdminModel.findOne({ [MongoFields.userId]: userId });
};
