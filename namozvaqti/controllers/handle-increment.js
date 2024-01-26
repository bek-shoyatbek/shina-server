import { AppError } from "../utils/error/app-error.js";
import Ad from "../models/ad.js";

export const handleIncrement = async (req, res, next) => {
    try {
        const { id, prop } = req.query;
        if (!id || !prop) throw new AppError('Missing parameter: "id" or "prop"');

        console.log(id, prop);
        let result;
        if (prop == "clicked") {
            result = await Ad.findOneAndUpdate({ _id: id }, { $inc: { clicked: 1 } }).exec();
        }
        if (prop == "seen") {
            result = await Ad.findOneAndUpdate({ _id: id }, { $inc: { seen: 1 } }).exec();
        }

        return res.status(200).send("Incremented...");

    } catch (err) {
        next(err);
    }
}