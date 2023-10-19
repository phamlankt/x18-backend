import { ApplicantModel, BusinessSectorModel } from "../../globals/mongodb.js";

export const businessSectorCreate = async (data) => {
  const { name } = data;

  const BSDoc = new BusinessSectorModel({
    name: name,
  });

  return await BSDoc.save();
};

export const businessSectorUpdateById = async (data) => {
  const { id, name } = data;

  const existingBS = await businessSectorGetById(id);

  if (!existingBS) throw new Error("Sector does not exist");

  if (name) {
    existingBS.name = name;
  }

  return await existingBS.save();
};

export const businessSectorGetAll = async () => {
  return await BusinessSectorModel.find({});
};

export const businessSectorGetById = async (id) => {
  return await BusinessSectorModel.findOne({ [MongoFields.id]: id });
};
