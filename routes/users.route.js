import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import UserController from "../controllers/user.controller.js";
import { uploadFile } from "../middlewares/multer.js";
import { validationProfileMdw } from "../middlewares/validate.middleware.js";
import checkRole from "../middlewares/checkRole.middleware.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";
import { checkUser } from "../middlewares/checkUser.middlewarae.js";

const userRouter = express.Router();

userRouter.get(
  "/",
  jwtCheck,
  checkRole(["admin", "recruiter"]),
  checkQuery(["search", "roles", "currentPage", "pageSize"]),
  checkUser,
  UserController.userGetAll
);
userRouter.put(
  "/update",
  jwtCheck,
  validationProfileMdw(),
  UserController.profileUpdateById
);
userRouter.put("/changePassword", UserController.userChangePassword);
userRouter.put("/resetPassword", UserController.userResetPassword);
userRouter.post(
  "/upload-avatar",
  uploadFile.single("avatar"),
  jwtCheck,
  UserController.avatarUpload
);

userRouter.post(
  "/upload-logo",
  uploadFile.single("avatar"),
  jwtCheck,
  UserController.companyLogoUpload
);

export default userRouter;
