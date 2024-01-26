import Ad from "../models/ad.js";


export const getAds = async (req, res, next) => {
    try {
        const ads = await Ad.find({ active: true }).select("-__v").lean();
        if (!ads) {
            return res.status(404).send("No ads found");
        }
        res.status(200).send(ads);
        return;
    } catch (err) {
        next(err);
    }
}

