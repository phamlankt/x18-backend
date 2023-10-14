import express from "express";
import BusinessSectorController from "../controllers/businessSector.controller.js";


const bSRouter = express.Router();



bSRouter.get("/", BusinessSectorController.getAll);



export default bSRouter;
