import { MongoFields } from "../../globals/fields/mongo.js";
import { RoleModel } from "../../globals/mongodb.js";

export const roleGetByName = async (roleName) => {
  return await RoleModel.findOne({ [MongoFields.roleName]: roleName });
};
export const roleGetById = async (id) => {
  return await RoleModel.findOne({ [MongoFields.id]: id });
};
export const roleGetAll = async () => {
  return await RoleModel.find();
};
