import express from "express";
import checkRole from "../middlewares/checkRole.middleware.js";
import { checkUser } from "../middlewares/checkUser.middlewarae.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";
import UserController from "../controllers/user.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";

const adminRouter = express.Router();

adminRouter.use(jwtCheck);
adminRouter.use(checkRole(["admin", "superadmin"]));
adminRouter.use(checkUser);

adminRouter.get(
  "/users",
  checkQuery(["search", "roles", "currentPage", "pageSize"]),
  UserController.userGetAll
);

////more apis
//....

export default adminRouter;