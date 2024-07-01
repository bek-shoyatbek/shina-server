import express from "express";
import {
  addNewLocation,
  deleteLocation,
  getAllLocations,
  updateLocation,
} from "../controllers/location.controller.js";

export const router = express.Router();

router.get("/all", getAllLocations);

router.post("/create", addNewLocation);

router.delete("/remove/:locationId", deleteLocation);

router.patch("/update/:locationId", updateLocation);
