import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import UserController from "../controllers/user.controller.js";
import { uploadFile } from "../middlewares/multer.js";
import { validationProfileMdw } from "../middlewares/validate.middleware.js";

const userRouter = express.Router();

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

export default userRouter;
