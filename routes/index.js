import express from "express";
import authRouter from "./auth.route.js";
import jobRouter from "./job.route.js";
import applicationRouter from "./application.route.js";


const router = express.Router();


router.use("/auth", authRouter);
router.use("/jobs", jobRouter);
router.use("/applications", applicationRouter);


export default router;
