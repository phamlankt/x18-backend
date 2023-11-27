import { MongoFields } from "../../globals/fields/mongo.js";
import { ApplicantModel } from "../../globals/mongodb.js";

export const applicantCreate = async (data) => {
  const userDoc = new ApplicantModel(data);
  return await userDoc.save();
};

export const applicantUpdateByUserId = async (data) => {
  const { userId } = data;
  delete data.id;
  const existingUser = await applicantGetByUserId(userId);

  if (!existingUser) throw new Error("User does not exist");
  for (const prop in data) {
    existingUser[prop] = data[prop];
  }

  return await existingUser.save();
};

export const applicantGetByUserId = async (userId) => {
  return await ApplicantModel.findOne({ [MongoFields.userId]: userId });
};
