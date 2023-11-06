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
    res.status(201).json(createdBusinessSector);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing business sector by ID
const updateBSector = async (req, res) => {
  try {
    const { name } = req.body;
    const businessSectorId = req.params.id;
    const updatedBusinessSector = await updateBusinessSector(businessSectorId, name);
    res.status(200).json(updatedBusinessSector);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const BusinessSectorController = {
  getAll,
  createBSector,
  updateBSector
};

export default BusinessSectorController;
