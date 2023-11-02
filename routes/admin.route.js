import express from "express";
import { jwtCheck } from "../middlewares/jwt.js";
import admin from "../controllers/admin.controller.js";




const adminRouter = express.Router();












adminRouter.post("/create", jwtCheck, admin.createAdmin)
adminRouter.post("/update", jwtCheck, admin.updateAdmin)

export default adminRouter
