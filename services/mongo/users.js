import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { UserModel } from "../../globals/mongodb.js";
import { role_getById } from "./roles.js";
import { recruiter_getByUserId } from "./recruiters.js";
import { applicant_getByUserId } from "./applicant.js";
import { admin_getByUserId } from "./admin.js";

export const user_create = async (data, isHashPassword = true) => {
  const { email, password, roleId } = data;

  const userDoc = new UserModel({
    email: email,
    password: isHashPassword ? await hashPassWord(password) : password,
    is_password_resetting: false,
    status: "active",
    roleId: roleId,
  });

  return await userDoc.save();
};

export const user_updateById = async (data) => {
  const { id, email, password, is_password_resetting, status, roleId } = data;

  const existingUser = await user_getById(id);

  if (!existingUser) throw new Error("User does not exist");

  if (password) {
    const hashedPassword = await hashPassWord(password);
    existingUser.password = hashedPassword;
  }

  if (email) {
    existingUser.email = email;
  }

  if (is_password_resetting) {
    existingUser.is_password_resetting = true;
  } else existingUser.is_password_resetting = false;

  if (status) {
    existingUser.status = status;
  }

  if (roleId) {
    existingUser.roleId = roleId;
  }

  return await existingUser.save();
};

export const user_getById = async (id, isShowPassword = false) => {
  if (isShowPassword) return await UserModel.findOne({ [MongoFields.id]: id });
  return await UserModel.findOne({ [MongoFields.id]: id }).select("-password");
};

export const user_getByEmail = async (email, isShowPassword = false) => {
  if (isShowPassword)
    return await UserModel.findOne({ [MongoFields.email]: email });
  return await UserModel.findOne({ [MongoFields.email]: email }).select(
    "-password"
  );
};

export const user_getAllDetailsById = async (id) => {
  let currentUser = await user_getById(id);
  const currentRole = await role_getById(currentUser.roleId);
  const roleName = currentRole.name;
  if (currentRole.name.includes("recruiter")) {
    const currentRecruiter = await recruiter_getByUserId(id);
    const {
      companyName,
      phoneNumber,
      address,
      sectors,
      description,
      avatarUrl,
    } = currentRecruiter;
    currentUser = {
      ...currentUser[MongoFields.doc],
      roleName,
      companyName,
      phoneNumber,
      address,
      sectors,
      description,
      avatarUrl,
    };
  } else if (currentRole.name.includes("applicant")) {
    const currentApplicant = await applicant_getByUserId(id);
    const {
      fullName,
      phoneNumber,
      age,
      gender,
      address,
      sectors,
      description,
      avatarUrl,
    } = currentApplicant;
    currentUser = {
      ...currentUser[MongoFields.doc],
      roleName,
      fullName,
      phoneNumber,
      age,
      gender,
      address,
      sectors,
      description,
      avatarUrl,
    };
  } else if (currentRole.name.includes("admin")) {
    const currentAdmin = await admin_getByUserId(id);
    const { fullName, phoneNumber, avatarUrl } = currentAdmin;
    currentUser = {
      ...currentUser[MongoFields.doc],
      roleName,
      fullName,
      phoneNumber,
      avatarUrl,
    };
  }
  return currentUser;
};
// export const user_Recruiter_getById = async (id) => {
//   return await UserModel.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId(id) } },
//     {
//       $lookup: {
//         from: "recruiters",
//         localField: "userId",
//         foreignField: "_id",
//         as: "recruiters",
//       },
//     },
//   ]);
// };

export const user_getAll = async (isShowPassword = false, cussor = -1) => {
  let query = {};

  if (cussor > 0) {
    query[MongoFields.id] = { $lte: cussor };
  }

  if (isShowPassword)
    return await UserModel.find(query)
      .sort({ [MongoFields.id]: -1 })
      .limit(limit);
  return await UserModel.find(query)
    .sort({ [MongoFields.id]: -1 })
    .limit(limit)
    .select("-password");
};

export const user_getAllByKiot = async (
  kiotId = -1,
  isShowPassword = false,
  cussor = -1
) => {
  let query = {};

  if (Boolean(kiotId) && kiotId > 0) {
    query[MongoFields.kiot_id] = kiotId;
  }

  if (cussor > 0) {
    query[MongoFields.id] = { $lte: cussor };
  }

  if (isShowPassword)
    return await UserModel.find(query)
      .sort({ [MongoFields.id]: -1 })
      .limit(limit);
  return await UserModel.find(query)
    .sort({ [MongoFields.id]: -1 })
    .limit(limit)
    .select("-password");
};
