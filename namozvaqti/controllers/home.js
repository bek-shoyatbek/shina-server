import Ad from "../models/ad.js";



export const getHome = async (req, res, next) => {
    try {
        const ads = await Ad.find().select("-__v").lean();
        res.render("home", { ads });
        return;
    } catch (err) {
        next(err);
    }
}

