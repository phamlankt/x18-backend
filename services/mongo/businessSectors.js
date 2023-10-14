import { ApplicantModel, BusinessSectorModel } from "../../globals/mongodb.js";

export const businessSector_create = async (data) => {
  const { name } = data;

  const BSDoc = new BusinessSectorModel({
    name: name,
  });

  return await BSDoc.save();
};

export const businessSector_updateById = async (data) => {
  const { id, name } = data;

  const existingBS = await businessSector_getById(id);

  if (!existingBS) throw new Error("Sector does not exist");

  if (name) {
    existingBS.name = name;
  }

  return await existingBS.save();
};

export const businessSector_getAll = async () => {
  return await BusinessSectorModel.find({});
};

export const businessSector_getById = async (id) => {
  return await BusinessSectorModel.findOne({ [MongoFields.id]: id });
};
