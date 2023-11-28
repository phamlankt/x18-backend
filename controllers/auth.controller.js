import asyncHandler from "express-async-handler";
import {
  userCreate,
  userGetAllDetailsById,
  userGetByEmail,
} from "../services/mongo/users.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { MongoFields } from "../globals/fields/mongo.js";
import { comparePassWord } from "../globals/config.js";
import { jwtSign } from "../globals/jwt.js";
import { roleGetById, roleGetByName } from "../services/mongo/roles.js";
import { recruiterCreate } from "../services/mongo/recruiters.js";
import { applicantCreate } from "../services/mongo/applicant.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    //   1. Validation
    if (!email || !password) throw new Error("Missing required fields");

    //   2. Check authentication
    const existingUser = await userGetByEmail(email, true);

    if (!existingUser) throw new Error("Invalid credentials!");

    // 3. Check password
    const isMatchPassword = await comparePassWord(
      password,
      existingUser.password
    );
    if (!isMatchPassword) throw new Error("Email or password is not correct!");

    // Create JWT Token & Response to client
    const roleObj = await roleGetById(existingUser.roleId);
    const roleName = roleObj.name;

    const jwtPayload = {
      id: existingUser[MongoFields.id],
      [MongoFields.email]: existingUser[MongoFields.email],
      roleName: roleName,
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
    if (await userGetByEmail(email)) throw new Error("User exists");

    // Get roleid
    const r = await roleGetByName(role);
    if (!r) throw new Error("Role does not exist!");
    const roleId = r[MongoFields.id];

    //  Create new register object
    const newRegister = await userCreate({
      email,
      password,
      roleId,
    });

    delete newRegister[MongoFields.doc].password;

    // Create object in recruiters or applicants collection
    if (role === "recruiter")
      await recruiterCreate({ userId: newRegister[MongoFields.id] });
    else if (role === "applicant")
      await applicantCreate({ userId: newRegister[MongoFields.id] });
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
});

const AuthController = {
  login,
  register,
  getMe,
};

export default AuthController;
