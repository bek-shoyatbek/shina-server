import Ad from "../models/ad.js";
import { join } from "node:path";
import { deleteFile } from "../utils/delete-file.js";
import config from "../config/index.js";


export const deleteAd = async (req, res, next) => {
    try {
        const id = req.query?.id;

        const ad = await Ad.findOne({ _id: id }).lean();

        if (!ad) return res.status(404).send("No such advertisement found");
        const pathToDelete = join(config.appRootPath, "public", "images", ad.image);
        await deleteFile(pathToDelete);
        await Ad.findOneAndDelete({ _id: id });
        res.status(200).send({ message: "Deleted successfully" });
        return;
    } catch (err) {
        console.log(err);
        next(err);
    }
}