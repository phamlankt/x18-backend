import { MongoFields } from "../../globals/fields/mongo.js";
import { RoleModel } from "../../globals/mongodb.js";



export const role_getByName = async (roleName) => {
  return await RoleModel.findOne({ [MongoFields.roleName]: roleName })
};
export const role_getById = async (id) => {
  return await RoleModel.findOne({ [MongoFields.id]: id })
};


