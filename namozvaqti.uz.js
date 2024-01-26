const API = "http://161.35.198.166:2000";
import axios from "axios";
import { Router } from "express";

const getAds = async (req, res, next) => {
    try {
        const ads = await axios.get(`${API}/get-ads`);

        return res.status(200).send(ads.data);

    } catch (err) {
        return res.status(500).send("Internal server error");
    }
}

const handleIncrement = async (req, res, next) => {
    try {
        const { id, prop } = req.query;
        if (!id || !prop) throw new Error('Missing parameters');
        await axios.get(`${API}/handle-increment?id=${id}&prop=${prop}`);
        return res.status(200).send({ message: 'Successfully incremented' });
    } catch (err) {
        return res.status(500).send("Internal server error");
    }
}


const router = Router();

router.get("/get-ads", getAds);
router.get("/handle-increment", handleIncrement);

export default router;


// ! Test
// (async () => {
//     const ads = await getAds();
//     // console.log(ads);
// })()