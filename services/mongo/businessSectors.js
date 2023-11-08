import { ApplicantModel, BusinessSectorModel } from "../../globals/mongodb.js";

// export const businessSectorCreate = async (data) => {
//   const { name } = data;
//   const BSDoc = new BusinessSectorModel({
//     name: name,
//   });

//   return await BSDoc.save();
// };
// export const businessSectorUpdateById = async (data) => {
//   const { id, name } = data;
//   const existingBS = await businessSectorGetById(id);
//   if (!existingBS) throw new Error("Sector does not exist");
//   if (name) {
//     existingBS.name = name;
//   }
//   return await existingBS.save();
// };

export const createBusinessSector = async (name, user) => {
  if (!user) {
    throw new Error('User does not exist!');
  }
  if (!name || name.trim() === '') {
    throw new Error('Business sector name is missing or empty!');
  }
  const duplicateBusinessSector = await BusinessSectorModel.findOne({
    name: name.toLowerCase(),
  });
  if (duplicateBusinessSector) {
    throw new Error('Duplicate business sector name!');
  }
  const newBusinessSector = new BusinessSectorModel({ name });
  return await newBusinessSector.save();
};

export const updateBusinessSector = async (id, name, user) => {
  if (!user) {
    throw new Error('User does not exist!');
  }
  if (!name || name.trim() === '') {
    throw new Error('Business sector name is missing or empty!');
  }
  const existingBusinessSector = await BusinessSectorModel.findById(id);
  if (!existingBusinessSector) {
    throw new Error('Business sector does not exist!');
  }

  const duplicateBusinessSector = await BusinessSectorModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    _id: { $ne: id }, // Exclude the current business sector from the check
  });

  if (duplicateBusinessSector) {
    throw new Error('Duplicate business sector name!');
  }

  existingBusinessSector.name = name;
  return await existingBusinessSector.save();
};

export const businessSectorGetAll = async () => {
  return await BusinessSectorModel.find({});
};

export const businessSectorGetById = async (id) => {
  return await BusinessSectorModel.findOne({ [MongoFields.id]: id });
};

