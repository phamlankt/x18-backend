import asyncHandler from "express-async-handler";
import { RESPONSE } from "../globals/api.js";
import { adminCreate, adminGetByUserId, adminUpdateByUserId } from "../services/mongo/admin.js";
import { userCreate, userUpdateById } from "../services/mongo/users.js";
import { uploadStream } from "../middlewares/multer.js";


const createAdmin = asyncHandler( async(req, res) => {
    const { fullName, phoneNumber, avatarUrl, email, password, roles } = req.body;
    const dataToCreateUser = { email, password, roleId : roles === 'admin' ? '65277e1a167e7b1fe3d88cf4' : '65277b98167e7b1fe3d88cf0'}
    try { 
        const createUser = await userCreate(dataToCreateUser, true)
        const dataToCreateAdmin = { userId : createUser._id, fullName, phoneNumber, avatarUrl}
          const createAdmin =  await adminCreate(dataToCreateAdmin)
           res.send(
            RESPONSE(
              [],
              "Successfully"
            )
          );    
    } catch (err) {
        res.status(400).send(RESPONSE([], "Unsuccessful", err.error, err.message, {mes: '123'}));
    }
})

const updateAdmin = asyncHandler(async (req, res) => {
  const { userId, fullName, phoneNumber} = req.body;
  try {
    if(req.file) {
      const src = await uploadStream(req.file.buffer);
      if (!src) throw new Error("Missing required fields");
      const checkAdmin = await adminGetByUserId(userId);
      const dataToUpdateAdmin = { fullName, phoneNumber, avatarUrl: src.url }
      if (checkAdmin) {
          const createAdmin =  await adminUpdateByUserId(dataToUpdateAdmin)
          res.status(200).send({data: createAdmin})
      } else {
        res.status(400).send(RESPONSE([], "Unsuccessful", { error: 'Wrong id' }))
      }
    } else {
      const checkAdmin = await adminGetByUserId(userId);
      if (checkAdmin) {
          const dataToUpdateAdmin = { fullName, phoneNumber, avatarUrl: checkAdmin.avatarUrl}
          const createAdmin =  await adminUpdateByUserId(dataToUpdateAdmin)
          res.send({data: createAdmin})
      } else {
        res.status(400).send(RESPONSE([], "Unsuccessful", { error: 'Wrong id' }))
      }
    }
  } catch (err) {
      res.status(400).send(RESPONSE([], "Unsuccessful", err.error, err.message));
  }
})

const admin = {
    createAdmin,
    updateAdmin
}

export default admin