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

export const createBusinessSector = async (name) => {
  if (!name || name.trim() === "") {
    throw new Error("Business sector name is missing or empty!");
  }

  const duplicateBusinessSector = await BusinessSectorModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (duplicateBusinessSector) {
    throw new Error("Duplicate business sector name!");
  }
  const newBusinessSector = new BusinessSectorModel({ name });
  return await newBusinessSector.save();
};

export const updateBusinessSector = async (sectorId, name) => {
  if (!name || name.trim() === "") {
    throw new Error("Business sector name is missing or empty!");
  }
  const existingBusinessSector = await BusinessSectorModel.findById(sectorId);
  if (!existingBusinessSector) {
    throw new Error("Business sector does not exist!");
  }

  const duplicateBusinessSector = await BusinessSectorModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    _id: { $ne: sectorId }, // Exclude the current business sector from the check
  });

  if (duplicateBusinessSector) {
    throw new Error("Duplicate business sector name!");
  }

  existingBusinessSector.name = name;
  return await existingBusinessSector.save();
};

export const businessSectorGetAll = async (data = {}) => {
  let { search, pageSize, currentPage } = data;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  currentPage = currentPage || 1;
  const offset = (currentPage - 1) * pageSize;

  const totalSectorCount = await BusinessSectorModel.countDocuments(query);
  if (totalSectorCount === 0) {
    return {
      sectors: [],
      pagination: {
        totalSectorCount,
        isNext: false,
        offset,
        pageSize,
      },
    };
  }

  const sectors = await BusinessSectorModel.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(pageSize))
    .skip(offset);

  const isNext = totalSectorCount > offset + sectors.length;
  const pagination = {
    totalSectorCount,
    isNext,
    offset,
    pageSize,
  };
  return {
    sectors,
    pagination,
  };
};

export const businessSectorGetById = async (id) => {
  return await BusinessSectorModel.findOne({ [MongoFields.id]: id });
};
