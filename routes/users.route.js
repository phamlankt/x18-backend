import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import UserController from "../controllers/user.controller.js";
import { uploadFile } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.put("/update", jwtCheck, UserController.profile_updateById);
userRouter.put("/changePassword", UserController.user_changePassword);
userRouter.post("/upload-avatar",uploadFile.single("avatar"),jwtCheck, UserController.avatarUpload);

export default userRouter;
