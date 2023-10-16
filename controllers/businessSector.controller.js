import asyncHandler from "express-async-handler";
import { businessSector_getAll } from "../services/mongo/businessSectors.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";



const getAll = asyncHandler(async (req, res) => {
  try {
    const businessSectors = await businessSector_getAll();
    res.send(
      RESPONSE(
        {
          [ResponseFields.businessSectorList]: businessSectors,
        },
        "Successfully"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.errors, e.message));
  }
});





const BusinessSectorController = {
  getAll
};

export default BusinessSectorController;
