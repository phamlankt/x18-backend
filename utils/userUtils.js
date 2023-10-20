import { UserModel } from "../globals/mongodb.js";

export const checkIfUserExists = async (userId) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    return !!user;
  } catch (error) {
    console.error(`Error checking user existence: ${error.message}`);
    return false;
  }
};

export const checkIfUserIsActive = async (userId) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    return !!user && user.status === 'active';
  } catch (error) {
    console.error(`Error checking user activity: ${error.message}`);
    return false;
  }
};