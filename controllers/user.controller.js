import { recruiterUpdateByUserId } from "../services/mongo/recruiters.js";
import { applicantUpdateByUserId } from "../services/mongo/applicant.js";
import { adminUpdateByUserId } from "../services/mongo/admin.js";
import {
  userGetAllDetailsById,
  userGetByEmail,
  getUserById,
  userUpdateById,
  getAllUserByQuery,
  userGetStatistic,
} from "../services/mongo/users.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { comparePassWord } from "../globals/config.js";
import { uploadStream } from "../middlewares/multer.js";
import { jwtVerify } from "../globals/jwt.js";
import { MongoFields } from "../globals/fields/mongo.js";
import expressAsyncHandler from "express-async-handler";

export const profileUpdateById = async (req, res) => {
  const data = req.body;
  console.log("data", data);
  const { id, roleName } = req.body;
  try {
    await userUpdateById(data);
    if (roleName === "recruiter") await recruiterUpdateByUserId(data);
    else if (roleName === "applicant") await applicantUpdateByUserId(data);
    else if (roleName === "admin" || roleName === "superadmin")
      await adminUpdateByUserId(data);
    const currentUser = await userGetAllDetailsById(id);
    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: currentUser,
        },
        "Successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.errors, e.message));
  }
};

export const userChangePassword = async (req, res) => {
  const { id, currentPassword, password } = req.body;

  try {
    if (!currentPassword || !password)
      throw new Error("Missing required fields");
    const existingUser = await getUserById(id, true);

    if (!existingUser) throw new Error("Invalid credentials!");
    const isMatchPassword = await comparePassWord(
      currentPassword,
      existingUser.password
    );
    if (!isMatchPassword) throw new Error("Current password is not correct!");
    await userUpdateById({ id, currentPassword, password });
    const currentUser = await userGetAllDetailsById(id);
    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: currentUser,
        },
        "Successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.errors, e.message));
  }
};

export const userResetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) throw new Error("Missing required fields");
    // decrypt token, get email from the token and check if that email has is_resetting_password=true
    const { receivedEmail } = jwtVerify(token);

    const existingUser = await userGetByEmail(receivedEmail, true);

    if (!existingUser) throw new Error("User does not exist!");
    // check if user with this email requested to change password
    if (!existingUser.is_password_resetting)
      throw new Error("User did not request to reset password!");

    const isMatchPassword = await comparePassWord(
      password,
      existingUser.password
    );
    if (isMatchPassword)
      throw new Error("New password should  be different from the old one!");
    await userUpdateById({
      id: existingUser[MongoFields.id],
      password,
      is_password_resetting: false,
    });
    const currentUser = await userGetAllDetailsById(
      existingUser[MongoFields.id]
    );
    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: currentUser,
        },
        "Successfully"
      )
    );
  } catch (e) {
    if (e.message === "jwt expired") {
      return res.status(403).json({
        message: "Token is expired",
      });
    }
    res.status(400).send(RESPONSE([], "Unsuccessful", e.errors, e.message));
  }
};

export const avatarUpload = async (req, res) => {
  try {
    const { id, roleName } = req.users;
    const src = await uploadStream(req.file.buffer);
    if (!src) throw new Error("Missing required fields");
    const updated_info = {
      userId: id,
      avatarUrl: src.url,
    };
    let result;
    if (roleName === "recruiter")
      result = await recruiterUpdateByUserId(updated_info);
    else if (roleName === "applicant")
      result = await applicantUpdateByUserId(updated_info);
    else if (roleName === "admin")
      result = await adminUpdateByUserId(updated_info);

    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: result,
        },
        "Update successful"
      )
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

export const companyLogoUpload = async (req, res) => {
  try {
    const { id, roleName } = req.users;
    const src = await uploadStream(req.file.buffer);
    if (!src) throw new Error("Missing required fields");
    const updated_info = {
      userId: id,
      companyLogoUrl: src.url,
    };
    // let result;
    if (roleName !== "recruiter")
      throw new Error("User needs to be a recruiter to upload company logo");
    const result = await recruiterUpdateByUserId(updated_info);

    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: result,
        },
        "Update successful"
      )
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

const userGetAll = expressAsyncHandler(async (req, res) => {
  const query = req.query;
  const userInfo = req.users;

  const users = await getAllUserByQuery(query, userInfo);

  res.send(RESPONSE({ [ResponseFields.userList]: users }, "Successfully"));
});

const getUserStatistic = expressAsyncHandler(async (req, res) => {
  const userStatistic = await userGetStatistic();

  res.send(userStatistic);
});

const UserController = {
  getUserStatistic,
  userGetAll,
  profileUpdateById,
  userChangePassword,
  userResetPassword,
  avatarUpload,
  companyLogoUpload,
};

export default UserController;
