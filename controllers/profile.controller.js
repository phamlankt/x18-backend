import { recruiter_updateByUserId } from "../services/mongo/recruiters.js";
import { applicant_updateByUserId } from "../services/mongo/applicant.js";
import { admin_updateByUserId } from "../services/mongo/admin.js";
import {
  user_getAllDetailsById,
  user_updateById,
} from "../services/mongo/users.js";
import fs from "fs";
// import uploadFile from "../configs/multer.config.js";
import { v2 as cloudinary } from "cloudinary";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";

cloudinary.config({
  cloud_name: "hypertal",
  api_key: "128245271721292",
  api_secret: "z7A4b2fS5Tp0sTuLMkkWAmNqpaU",
});

export const profile_updateById = async (req, res) => {
  const data = req.body;
  const { id, roleName } = req.body;
  try {
    await user_updateById(data);
    if (roleName === "recruiter") await recruiter_updateByUserId(data);
    else if (roleName === "applicant") await applicant_updateByUserId(data);
    else if (roleName === "admin") await admin_updateByUserId(data);
    const currentUser = await user_getAllDetailsById(id);
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
};

export const profile_avatarUpdate = async (data) => {
  // uploadFile.single("avatar"),
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
  };
};
const ProfileController = {
  profile_updateById,
  profile_avatarUpdate,
};

export default ProfileController;
