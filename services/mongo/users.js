import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import { UserModel } from "../../globals/mongodb.js";
import { roleGetById } from "./roles.js";
import { recruiterGetByUserId } from "./recruiters.js";
import { applicantGetByUserId } from "./applicant.js";
import { adminGetByUserId } from "./admin.js";

export const userCreate = async (data, isHashPassword = true) => {
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

export const userUpdateById = async (data) => {
  const { id, email, password, is_password_resetting, status, roleId } = data;

  const existingUser = await getUserById(id);

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

export const getUserById = async (id, isShowPassword = false) => {
  if (isShowPassword) return await UserModel.findOne({ [MongoFields.id]: id });
  return await UserModel.findOne({ [MongoFields.id]: id }).select("-password");
};

export const userGetByEmail = async (email, isShowPassword = false) => {
  if (isShowPassword)
    return await UserModel.findOne({ [MongoFields.email]: email });
  return await UserModel.findOne({ [MongoFields.email]: email }).select(
    "-password"
  );
};

export const userGetAllDetailsById = async (id) => {
  let currentUser = await getUserById(id);
  if (!currentUser) throw new Error("User does not exist");
  const currentRole = await roleGetById(currentUser.roleId);
  if (!currentRole) throw new Error("Role does not exist");
  const roleName = currentRole.name;
  if (currentRole.name.includes("recruiter")) {
    const currentRecruiter = await recruiterGetByUserId(id);
    if (!currentRecruiter) throw new Error("Recruiter does not exist");
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
    const currentApplicant = await applicantGetByUserId(id);
    if (!currentApplicant) throw new Error("Applicant does not exist");
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
    const currentAdmin = await adminGetByUserId(id);
    if (!currentAdmin) throw new Error("Admin does not exist");
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

export const userGetAll = async (isShowPassword = false, cussor = -1) => {
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
