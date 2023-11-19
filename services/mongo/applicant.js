import { MongoFields } from "../../globals/fields/mongo.js";
import { ApplicantModel } from "../../globals/mongodb.js";

export const applicantCreate = async (data) => {
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

export const applicantUpdateByUserId = async (data) => {
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
    documents,
  } = data;

  const existingUser = await applicantGetByUserId(userId);

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

  if (documents) {
    if (existingUser.documents) {
      const existingDocuments = existingUser.documents;
      const filteredExistingDocuments = existingDocuments.filter(
        (docu) => !containDuplicateDocument(docu, documents)
      );
      existingUser.documents = [...filteredExistingDocuments, ...documents];
    } else existingUser.documents = documents;
  }

  return await existingUser.save();
};

const containDuplicateDocument = (docu, newDocuList) => {
  const filterDocuList = newDocuList.filter((dc) => dc.name === docu.name);
  if (filterDocuList.length > 0) return true;
  else return false;
};

export const applicantGetByUserId = async (userId) => {
  return await ApplicantModel.findOne({ [MongoFields.userId]: userId });
};
