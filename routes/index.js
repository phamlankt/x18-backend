import express from "express";
import authRouter from "./auth.route.js";
import jobRouter from "./job.route.js";
import applicationRouter from "./application.route.js";
import userRouter from "./users.route.js";
import bSRouter from "./businessSector.route.js";
import mailRouter from "./mail.route.js";


const router = express.Router();

router.use("/mail", mailRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/jobs", jobRouter);
router.use("/applications", applicationRouter);
router.use("/businessSectors", bSRouter);


export default router;
