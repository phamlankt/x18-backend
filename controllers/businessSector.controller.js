import asyncHandler from "express-async-handler";
import { businessSectorGetAll } from "../services/mongo/businessSectors.js";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import {
  createBusinessSector,
  updateBusinessSector,
} from "../services/mongo/businessSectors.js";

const getAll = asyncHandler(async (req, res) => {
  const query = req.query;
  try {
    const businessSectors = await businessSectorGetAll(query);
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

const createBSector = asyncHandler(async (req, res) => {
  const { sector } = req.body;

  const createdBusinessSector = await createBusinessSector(sector);
  res.send(
    RESPONSE(
      {
        [ResponseFields.businessSectorInfo]: createdBusinessSector,
      },
      "Successfully created"
    )
  );
});

// Update an existing business sector by ID
const updateBSector = async (req, res) => {
  try {
    const { sectorId, sector } = req.body;
    const updatedBusinessSector = await updateBusinessSector(sectorId, sector);
    res.send(
      RESPONSE(
        {
          [ResponseFields.businessSectorInfo]: updatedBusinessSector,
        },
        "Successfully updated"
      )
    );
  } catch (e) {
    res
      .status(400)
      .send(RESPONSE([], "Unsuccessfully updated", e.errors, e.message));
  }
};

const BusinessSectorController = {
  getAll,
  createBSector,
  updateBSector,
};

export default BusinessSectorController;
