import express from "express";
import ProfileController from "../controllers/profile.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";

const userRouter = express.Router();

userRouter.put("/profile", jwtCheck, ProfileController.profile_updateById);

userRouter.post("/upload-avatar", ProfileController.profile_avatarUpdate);

export default userRouter;
