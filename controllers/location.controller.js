import LocationModel from "../models/location.model";


export const getAllLocations = async (req, res, next) => {
    let locations = await LocationModel.find();
    res.status(200).send(locations);
    return;
}

export const addNewLocation = async (req, res, next) => {
    try {
        const { location } = req.body;
        const newLocation = await LocationModel.create(location);
        return newLocation;
    } catch (err) {
        console.log(err);
    }
}

export const deleteLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;
        const result = await LocationModel.findByIdAndDelete(new mongoose.Types.ObjectId(locationId));
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const updateLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;
        const { updatedLocation } = req.body;
        await LocationModel.updateOne({ _id: new mongoose.Types.ObjectId(locationId) }, ...updatedLocation);
    } catch (err) {
        console.log(err);
    }
}