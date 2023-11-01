import expressAsyncHandler from "express-async-handler";
import { getUserById } from "../services/mongo/users.js";

const checkRole = (acceptedRoles) => {
  return expressAsyncHandler(async (req, res, next) => {
    const user = req.users;

    let isPass =
      acceptedRoles.length === 0 ? true : acceptedRoles.includes(user.roleName);
    if (!isPass) {
      res.status(401);
      throw new Error("Access denied");
    }

    next();
  });
};

export default checkRole;
