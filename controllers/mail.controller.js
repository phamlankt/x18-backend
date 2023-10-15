import { recruiter_updateByUserId } from "../services/mongo/recruiters.js";
import { applicant_updateByUserId } from "../services/mongo/applicant.js";
import { admin_updateByUserId } from "../services/mongo/admin.js";
import {
  user_getAllDetailsById,
  user_getById,
  user_updateById,
} from "../services/mongo/users.js";
import fs from "fs";
// import uploadFile from "../configs/multer.config.js";
import { v2 as cloudinary } from "cloudinary";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { comparePassWord } from "../globals/config.js";
import { uploadStream } from "../middlewares/multer.js";

export const send = async (req, res) => {
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

const MailController = {
  send,
};

export default MailController;
