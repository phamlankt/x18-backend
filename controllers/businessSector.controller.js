import asyncHandler from "express-async-handler";
import { businessSectorGetAll } from "../services/mongo/businessSectors.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import { createBusinessSector, updateBusinessSector } from "../services/mongo/businessSectors.js";

const getAll = asyncHandler(async (req, res) => {
  try {
    const businessSectors = await businessSectorGetAll();
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

const createBSector = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBusinessSector = await createBusinessSector(name);
    res.send(
      RESPONSE(
        {
          [ResponseFields.businessSectorList]: createdBusinessSector,
        },
        "Successfully created"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessfully created", e.errors, e.message));
  }
};

// Update an existing business sector by ID
const updateBSector = async (req, res) => {
  try {
    const { id, name } = req.body;
    const updatedBusinessSector = await updateBusinessSector(id, name);
    res.send(
      RESPONSE(
        {
          [ResponseFields.businessSectorList]: updatedBusinessSector,
        },
        "Successfully updated"
      )
    );
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessfully updated", e.errors, e.message));
  }
};

const BusinessSectorController = {
  getAll,
  createBSector,
  updateBSector
};

export default BusinessSectorController;
