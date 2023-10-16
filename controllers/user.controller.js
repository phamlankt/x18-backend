import { recruiter_updateByUserId } from "../services/mongo/recruiters.js";
import { applicant_updateByUserId } from "../services/mongo/applicant.js";
import { admin_updateByUserId } from "../services/mongo/admin.js";
import {
  user_getAllDetailsById,
  user_getByEmail,
  user_getById,
  user_updateById,
} from "../services/mongo/users.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { comparePassWord } from "../globals/config.js";
import { uploadStream } from "../middlewares/multer.js";
import { jwtVerify } from "../globals/jwt.js";
import { MongoFields } from "../globals/fields/mongo.js";

export const profile_updateById = async (req, res) => {
  const data = req.body;
  const { id, roleName } = req.body;
  try {
    await user_updateById(data);
    if (roleName === "recruiter") await recruiter_updateByUserId(data);
    else if (roleName === "applicant") await applicant_updateByUserId(data);
    else if (roleName === "admin") await admin_updateByUserId(data);
    const currentUser = await user_getAllDetailsById(id);
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

export const user_changePassword = async (req, res) => {
  const { id, currentPassword, password } = req.body;

  try {
    if (!currentPassword || !password)
      throw new Error("Missing required fields");
    const existingUser = await user_getById(id, true);

    if (!existingUser) throw new Error("Invalid credentials!");
    const isMatchPassword = await comparePassWord(
      currentPassword,
      existingUser.password
    );
    if (!isMatchPassword) throw new Error("Current password is not correct!");
    await user_updateById({ id, currentPassword, password });
    const currentUser = await user_getAllDetailsById(id);
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

export const user_resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) throw new Error("Missing required fields");
    // decrypt token, get email from the token and check if that email has is_resetting_password=true
    const { receivedEmail } = jwtVerify(token);

    const existingUser = await user_getByEmail(receivedEmail, true);

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
    await user_updateById({
      id: existingUser[MongoFields.id],
      password,
      is_password_resetting: false,
    });
    const currentUser = await user_getAllDetailsById(
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
      result = await recruiter_updateByUserId(updated_info);
    else if (roleName === "applicant")
      result = await applicant_updateByUserId(updated_info);
    else if (roleName === "admin")
      result = await admin_updateByUserId(updated_info);

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

const UserController = {
  profile_updateById,
  user_changePassword,
  user_resetPassword,
  avatarUpload,
};

export default UserController;
