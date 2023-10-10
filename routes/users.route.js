import express from "express";
import fs from "fs";
import uploadFile from "../configs/multer.config.js";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "../models/user.model.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

cloudinary.config({
  cloud_name: "hypertal",
  api_key: "128245271721292",
  api_secret: "z7A4b2fS5Tp0sTuLMkkWAmNqpaU",
});

const router = express.Router();

router.post("/", (req, res) => {
  res.send("API users");
});

router.post(
  "/upload-avatar",
  authMiddleware,
  uploadFile.single("avatar"),
  async (req, res) => {
    try {
      const { id } = req.user;

      // Step 1: add file from client to server
      const file = req.file;

      // Step 2: upload file to cloudinary => url
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "web70-social-app",
      });

      // Step 3:remove temp image
      fs.unlinkSync(file.path);

      const avatarUrl = result && result.secure_url;

      //Step 4: url => mongodb
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: id },
        {
          avatar: avatarUrl,
        },
        {
          new: true,
        }
      ).select("-password");

      return res.json({
        message: "Upload avatar successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

export default router;
