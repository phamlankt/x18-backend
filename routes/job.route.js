import express from "express";

import JobController from "../controllers/job.controller.js";


const jobRouter = express.Router();



jobRouter.get("/all", JobController.getAll);



export default jobRouter;
