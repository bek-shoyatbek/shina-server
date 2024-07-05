import mongoose from "mongoose";
import LocationModel from "../models/location.model.js";

export const getAllLocations = async (req, res, next) => {
  let locations = await LocationModel.find();
  res.status(200).send(locations);
  return;
};

export const addNewLocation = async (req, res, next) => {
  try {
    const { name, link, region } = req.body;
    const newLocation = await LocationModel.create({ name, link, region });
    res.status(201).send({ message: "Successfully added", data: newLocation });
    return;
  } catch (err) {
    console.log(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const result = await LocationModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(locationId)
    );
    res.status(200).send({ message: "Deleted", data: result });
    return;
  } catch (err) {
    console.log(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const updatedLocation = req.body;
    const result = await LocationModel.updateOne(
      { _id: new mongoose.Types.ObjectId(locationId) },
      updatedLocation
    );
    res.status(200).send({ message: "updated", data: result });
    return;
  } catch (err) {
    console.log(err);
  }
};
