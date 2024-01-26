import Ad from "../models/ad.js";

export const getAddPage = (req, res, next) => {
    res.render("add");
    return;
}



export const add = async (req, res, next) => {
    try {
        const image = req.file.filename;
        const { name, link, location } = req.body;
        const newAd = await Ad.create({
            name,
            link,
            image,
            location
        });
        await newAd.save();
        res.status(200).send({ message: "Uploaded successfully" });
        return;
    } catch (err) {
        next(err);
    }
}

