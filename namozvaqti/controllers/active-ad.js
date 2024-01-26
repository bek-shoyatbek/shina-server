import Ad from "../models/ad.js";

export const setActiveAd = async (req, res, next) => {
    try {
        const { id, active } = req.query;
        const ad = await Ad.findOne({ _id: id });
        if (!ad) return res.status(404).send("No ad found");
        await Ad.updateMany({ $and: [{ location: ad.location }, { _id: { $ne: id } }] }, { active: false });
        ad.active = active;
        await ad.save();
        res.status(200).send({ message: "Updated successfully" });
        return;
    } catch (err) {
        next(err);
    }
}
