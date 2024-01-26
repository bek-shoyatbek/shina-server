import Ad from "../models/ad.js";
import { deleteFile } from "../utils/delete-file.js";
import { AppError } from "../utils/error/app-error.js";
import { join } from "node:path";


export const getEditPage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ad = await Ad.findOne({ _id: id }).lean();
        res.render("edit", { ad: ad });
        return;
    } catch (err) {
        next(err);
    }
}

export const editAd = async (req, res, next) => {
    try {
        const { id } = req.params;
        const image = req?.file?.filename;

        const currentAd = await Ad.findOne({ _id: id });
        if (!currentAd) throw new AppError('No such advertisement found', 400);
        // Delete the old image file if a new one is provided
        if (image && currentAd.image !== image) {
            const oldImagePath = join('/public', currentAd.image);
            await deleteFile(oldImagePath);
        }

        const { name, link, location } = req.body;
        console.log(name, link, location);
        const updatedAd = await Ad.findOneAndUpdate({ _id: req.params.id }, { name, link, image: image || currentAd.image, location });

        if (!updatedAd) throw new AppError('No such advertisement found', 400);

        await updatedAd.save();

        res.status(200).send({ message: "Updated successfully" });
        return;
    } catch (err) {
        next(err);
    }
}
