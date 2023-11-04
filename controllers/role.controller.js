import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { roleGetAll } from "../services/mongo/roles.js";

const getAll = async (req, res) => {
  const roles = await roleGetAll();

  res.send(RESPONSE({ [ResponseFields.roleList]: roles }, "Successfully"));
};

const RoleController = { getAll };
export default RoleController;
