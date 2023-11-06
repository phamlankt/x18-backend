import express from "express";
import BusinessSectorController from "../controllers/businessSector.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";
import { validationProfileMdw } from "../middlewares/validate.middleware.js";
import checkRole from "../middlewares/checkRole.middleware.js";

const bSRouter = express.Router();

bSRouter.use(jwtCheck, validationProfileMdw);
bSRouter.get("/", BusinessSectorController.getAll);
bSRouter.post("/create", checkRole(["admin", "superadmin"]), BusinessSectorController.createBSector);
bSRouter.put("/update", checkRole(["admin", "superadmin"]), BusinessSectorController.updateBSector)

export default bSRouter;
