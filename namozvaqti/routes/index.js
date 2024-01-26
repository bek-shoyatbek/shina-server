import express from "express";


import { getLogin, login } from "../controllers/login.js";
import { getHome } from "../controllers/home.js";
import authorizeUser from "../middlewares/authorization.js";
import { add, getAddPage } from "../controllers/add.js";
import upload from "../utils/multer/index.js";
import { setActiveAd } from "../controllers/active-ad.js";
import { editAd, getEditPage } from "../controllers/edit.js";
import { deleteAd } from "../controllers/delete.js";
import { getAds } from "../controllers/getAds.js";
import { handleIncrement } from "../controllers/handle-increment.js";

const router = express.Router();


// Authorization
router.get("/login", getLogin);

router.post("/login", login);

// Home
router.get("/home", getHome);


// Add 
router.get("/add", getAddPage);


router.get("/get-ads", getAds);

router.post("/add", upload.single("image"), add);

// Edit 

router.put("/active", setActiveAd);

router.post("/update/:id", upload.single("image"), editAd);

router.get("/edit/:id", getEditPage);

router.delete("/delete", deleteAd);


// Handle views and clicks

router.get("/handle-increment", handleIncrement);


export default router