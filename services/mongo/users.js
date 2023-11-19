import { ObjectId } from "mongodb";
import { hashPassWord, limit } from "../../globals/config.js";
import { MongoFields } from "../../globals/fields/mongo.js";
import {
  AdminModel,
  ApplicantModel,
  RecruiterModel,
  RoleModel,
  UserModel,
} from "../../globals/mongodb.js";
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
      companyLogoUrl,
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
      companyLogoUrl,
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
      documents
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
      documents
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

export const getAllUserByQuery = async (query, userInfo) => {
  let { search, roles, currentPage, pageSize } = query;

  if (!currentPage || isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }
  if (!pageSize || isNaN(pageSize) || pageSize < 1) {
    pageSize = 10;
  }
  const offset = (currentPage - 1) * pageSize || 0;

  const queryOptions = {};

  if (search) {
    queryOptions.email = { $regex: search, $options: "i" };
  }

  if (roles) {
    const rolesArray = roles.split(",");
    queryOptions.roleId = {
      $in: rolesArray,
    };
  }

  const totalCounts = await UserModel.countDocuments(queryOptions);
  if (!totalCounts) {
    return {
      users: [],
      pagination: {
        totalCounts: 0,
        offset: 0,
        hasNext: false,
      },
    };
  }

  const users = await UserModel.find(queryOptions)
    .limit(pageSize)
    .skip(offset)
    .sort({
      createdAt: -1,
    })
    .select("-password");

  const userIds = users.map((user) => user._id);
  const userAdmins = await AdminModel.find({
    userId: { $in: userIds },
  });
  const userRecruiters = await RecruiterModel.find({
    userId: { $in: userIds },
  });
  const userApplicants = await ApplicantModel.find({
    userId: { $in: userIds },
  });

  const userInfoArr = [...userAdmins, ...userRecruiters, ...userApplicants];

  const responseUsers = users.map((user) => {
    const userInfo = userInfoArr.find((item) => {
      return (
        item.userId.toString() === user._id.toString() ||
        item.userId === user._id
      );
    });
    return {
      ...user.toObject(),
      avatarUrl: userInfo?.avatarUrl || userInfo?.companyAvatarUrl,
      fullName: userInfo?.fullName || userInfo?.companyName,
      phoneNumber: userInfo?.phoneNumber,
    };
  });

  const hasNext = totalCounts > offset + users.length;
  return {
    users: responseUsers,
    pagination: {
      totalCounts,
      offset,
      hasNext,
      pageSize,
    },
  };
};

export const userGetStatistic = async () => {
  const users = await UserModel.find({});
  const roles = await RoleModel.find({});

  let recruiterCount = 0;
  let applicantCount = 0;
  let adminCount = 0;
  let superAdminCount = 0;

  users.forEach((user) => {
    roles.forEach((role) => {
      if (user.roleId === role._id.toString() && role.name === "superadmin") {
        superAdminCount++;
      } else if (
        user.roleId === role._id?.toString() &&
        role.name === "admin"
      ) {
        adminCount++;
      } else if (
        user.roleId === role._id?.toString() &&
        role.name === "recruiter"
      ) {
        recruiterCount++;
      } else if (
        user.roleId === role._id?.toString() &&
        role.name === "applicant"
      ) {
        applicantCount++;
      }
    });
  });

  const totalUsers = users.length;

  const recruiterPercentage = (recruiterCount / totalUsers) * 100;
  const applicantPercentage = (applicantCount / totalUsers) * 100;
  const adminPercentage = (adminCount / totalUsers) * 100;
  const superAdminPercentage = (superAdminCount / totalUsers) * 100;

  const result = {
    Recruiter: recruiterPercentage,
    Applicant: applicantPercentage,
    Admin: adminPercentage,
    "Super Admin": superAdminPercentage,
  };

  return result;
};
