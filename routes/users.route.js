import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import UserController from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.put("/update", jwtCheck, UserController.profile_updateById);
userRouter.put("/changePassword", UserController.user_changePassword);
userRouter.post("/upload-avatar", UserController.profile_avatarUpdate);

export default userRouter;
