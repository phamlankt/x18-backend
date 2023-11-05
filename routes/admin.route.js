import express from "express";
import checkRole from "../middlewares/checkRole.middleware.js";
import { checkUser } from "../middlewares/checkUser.middlewarae.js";
import { checkQuery } from "../middlewares/checkQuery.middleware.js";
import UserController from "../controllers/user.controller.js";
import { jwtCheck } from "../middlewares/jwt.js";
import JobController from "../controllers/job.controller.js";
import admin from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.use(jwtCheck);
adminRouter.use(checkRole(["admin", "superadmin"]));
adminRouter.use(checkUser);

adminRouter.get(
  "/users",
  checkQuery(["search", "roles", "currentPage", "pageSize"]),
  UserController.userGetAll
);

adminRouter.get(
  "/jobs",
  checkQuery([
    "userId",
    "search",
    "sectors",
    "status",
    "sortField",
    "sortBy",
    "currentPage",
    "pageSize",
  ]),
  JobController.getJobByUserId
);
adminRouter.get(
  "/jobs",
  checkQuery([
    "userId",
    "search",
    "sectors",
    "status",
    "sortField",
    "sortBy",
    "currentPage",
    "pageSize",
  ]),
  JobController.getJobByUserId
);
adminRouter.put("/jobs/remove", JobController.removeJobByAdmin);

adminRouter.post("/create", jwtCheck, admin.createAdmin);
adminRouter.post("/update", jwtCheck, admin.updateAdmin);

export default adminRouter;
