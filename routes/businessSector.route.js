import express from "express";
import BusinessSectorController from "../controllers/businessSector.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";
import checkRole from "../middlewares/checkRole.middleware.js";
import { checkUser } from "../middlewares/checkUser.middlewarae.js";

const bSRouter = express.Router();

bSRouter.get("/", BusinessSectorController.getAll); /// public route, so no jwtCheck

bSRouter.use(jwtCheck, checkUser);
bSRouter.post(
  "/create",
  checkRole(["admin", "superadmin"]),
  BusinessSectorController.createBSector
);
bSRouter.put(
  "/update",
  checkRole(["admin", "superadmin"]),
  BusinessSectorController.updateBSector
);

export default bSRouter;
