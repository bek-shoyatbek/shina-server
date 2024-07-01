import locationModel from "../../models/location.model.js";
export async function fetchLocations() {
  try {
    return await locationModel.find();
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}
