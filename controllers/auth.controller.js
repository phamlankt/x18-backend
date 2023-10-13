import asyncHandler from "express-async-handler";
import {
  user_Recruiter_getById,
  user_create,
  user_getByEmail,
  user_getById,
} from "../services/mongo/users.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { MongoFields } from "../globals/fields/mongo.js";
import { comparePassWord } from "../globals/config.js";
import { jwtSign } from "../globals/jwt.js";
import { role_getById, role_getByName } from "../services/mongo/roles.js";
import { recruiter_create } from "../services/mongo/recruiters.js";
import { applicant_create } from "../services/mongo/applicant.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    //   1. Validation
    if (!email || !password) throw new Error("Missing required fields");

    //   2. Check authentication
    const existingUser = await user_getByEmail(email, true);

    if (!existingUser) throw new Error("Invalid credentials!");

    // 3. Check password
    const isMatchPassword = await comparePassWord(
      password,
      existingUser.password
    );
    if (!isMatchPassword) throw new Error("Email or password is not correct!");

    // Create JWT Token & Response to client
    const jwtPayload = {
      id: existingUser[MongoFields.id],
      [MongoFields.email]: existingUser[MongoFields.email],
      role: existingUser[MongoFields.role],
    };
    const token = jwtSign(jwtPayload, 60 * 24);

    res.send(
      RESPONSE(
        {
          [ResponseFields.accessToken]: token,
        },
        "Login successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(RESPONSE([], "Login unsuccessful", e.errors, e.message));
  }
});

const register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    //   Validation
    if (!email || !password || !role)
      throw new Error("Missing required fields");

    // Tránh trùng email
    if (await user_getByEmail(email)) throw new Error("User exists");

    // Get roleid
    const r = await role_getByName(role);
    const roleId = r[MongoFields.id];

    //  Create new register object
    const newRegister = await user_create({
      email,
      password,
      roleId,
    });
  
    delete newRegister[MongoFields.doc].password;

    // Create object in recruiters or applicants collection
    if (role === "recruiter")
      await recruiter_create({ userId: newRegister[MongoFields.id] });
    else if (role === "applicant")
      await applicant_create({ userId: newRegister[MongoFields.id] });
    // 4. Response to client
    res.send(
      RESPONSE(
        {
          [ResponseFields.userInfo]: newRegister,
        },
        "Register new user successfully"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(RESPONSE([], "Register unsuccessful", e.errors, e.message));
  }
};

const getMe = asyncHandler(async (req, res) => {
  const { id } = req.users;
  try {
    const currentUser = await user_getById(id);
    const currentRole = await role_getById(currentUser.roleId);
    if (currentRole.name.includes("recruiter")) {
      const currentRecruiter = await user_Recruiter_getById(id);
      console.log("currentRecruiter", currentRecruiter);
    }

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
});

const AuthController = {
  login,
  register,
  getMe,
};

export default AuthController;
