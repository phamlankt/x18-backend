import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import RoleController from "../controllers/role.controller.js";

const roleRouter = express.Router();

roleRouter.use(jwtCheck);

roleRouter.get("/", RoleController.getAll);

export default roleRouter;
