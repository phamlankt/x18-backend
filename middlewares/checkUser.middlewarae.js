import expressAsyncHandler from "express-async-handler";
import { getUserById } from "../services/mongo/users.js";

export const checkUser = expressAsyncHandler(async (req, res, next) => {
  const user = req.users;

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const existingUser = await getUserById(user.id);
  if (!existingUser || existingUser.status !== "active") {
    res.status(401);
    throw new Error("User does not exist");
  }

  next();
});
