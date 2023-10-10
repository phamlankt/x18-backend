import express from "express";
import { loginSchema } from "../validations/login.validation.js";
import AuthController from "../controllers/auth.controller.js";
import { validationMdw } from "../middlewares/validate.middleware.js";
import { jwtCheck } from "../middlewares/jwt.js";


const router = express.Router();

router.post("/login", validationMdw(loginSchema), AuthController.login);
router.post("/register", AuthController.register);
router.get("/me", jwtCheck,AuthController.getMe);


export default router;


