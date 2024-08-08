import express from "express";
import multer from "multer";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getOneById,
  getProducts,
  getUserOrders,
  orderProduct,
  updateProductById,
} from "./controllers.js";
import { bot } from "./bot/bot.js";
import {
  getUSDRate,
  setUSDRate,
} from "./src/controllers/currency.controller.js";
import storage from "./src/utils/multer/storage.js";

export const router = express.Router();

const upload = multer({ storage: storage });

router.get("/products", async (req, res, next) => {
  try {
    const products = await getProducts();

    if (!products) return res.status(204);
    return res.status(200).send(products);
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting products", err: err });
  }
});

router.get("/product/:productId", async (req, res, next) => {
  try {
    const product = await getOneById(req.params.productId);
    if (!product) return res.status(204).send({ message: "Product not found" });
    return res.status(200).send(product);
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting products", err: err });
  }
});

router.get("/order/:productId", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const { userContact, username } = req.query;
    if (!username || !userContact) {
      return res.status(400).send("No user information");
    }
    const creditType = req.query.creditType || "Kreditsiz";
    const credentials = {
      username,
      userContact,
      productId,
      creditType,
    };
    await orderProduct(credentials);
    const product = await getOneById(productId);
    let orderMessage = `${product.full_name} ${product.id}
            To'lov turi:${creditType}
            Telefon :${userContact}
            Telegram:@${username}
            Narxi:${product.price_usd}
            Kompaniyasi:${product.company}
            Naqtga:${product.percent_cash}
            Diametri:${product.diameter}
            O'lchami:${product.size}
            Uzunligi:${product.width}`;

    const result = await bot.telegram.sendMessage(
      process.env.NOTIFICATION_GROUP_ID,
      orderMessage
    );
    console.log(result);

    return res.status(200).send("New Product ordered");
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting products", err: err });
  }
});

router.get("/orders/:userContact", async (req, res, next) => {
  try {
    const { username } = req.query;
    const userOrders = await getUserOrders(req.params.userContact, username);

    if (!userOrders || !userOrders.length > 0)
      return res.status(204).send({ message: "no orders" });
    return res.status(200).send(userOrders);
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting user orders", err: err });
  }
});

router.post("/add", upload.single("image"), async (req, res, next) => {
  try {
    console.log("upcoming image", req.file);
    const image = req.file;
    if (!image) {
      return res.status(400).send("image is required");
    }
    const {
      full_name,
      full_model,
      price_usd,
      percent_3m,
      percent_6m,
      percent_9m,
      quantity,
      company,
      percent_cash,
      diameter,
      size,
      width,
    } = req.body;
    let imagePath = image.filename;

    const result = await addProduct({
      full_name,
      full_model,
      price_usd,
      percent_3m,
      percent_6m,
      percent_9m,
      quantity,
      company,
      percent_cash,
      diameter,
      size,
      width,
      image: imagePath,
    });
    if (!result) return res.status(404).send({ message: "Product not added" });
    return res
      .status(201)
      .send({ message: "Successfully added", data: result });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting updating product", err: err });
  }
});

router.post(
  "/product/update/:productId",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const image = req.file;
      const {
        full_name,
        full_model,
        price_usd,
        percent_3m,
        percent_6m,
        percent_9m,
        quantity,
        company,
        percent_cash,
        diameter,
        size,
        width,
      } = req.body;
      let imagePath = req.body.imagePath;
      if (image) {
        imagePath = image.filename;
      }
      const result = await updateProductById(
        req.params.productId,
        {
          full_name,
          full_model,
          price_usd,
          percent_3m,
          percent_6m,
          percent_9m,
          quantity,
          company,
          percent_cash,
          diameter,
          size,
          width,
          image: imagePath,
        },
        { new: true }
      );
      if (!result) return res.status(404).send({ message: "No product found" });
      return res
        .status(201)
        .send({ message: "Successfully updated", data: result });
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Error while getting updating product", err: err });
    }
  }
);

router.get("/product/delete/:productId", async (req, res, next) => {
  try {
    const result = await deleteProduct(req.params.productId);
    if (!result) return res.status(404).send({ message: "No product found" });
    return res
      .status(200)
      .send({ message: "Deleted successfully", data: result });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting updating product", err: err });
  }
});

router.get("/currency", async (req, res, next) => {
  try {
    const currencyRate = await getUSDRate();
    if (!currencyRate)
      return res.status(404).send({ message: "Currency rate not found" });
    return res
      .status(200)
      .send({ message: "Successfully fetched", data: currencyRate });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting updating product", err: err });
  }
});

router.get("/currency/update", async (req, res, next) => {
  try {
    const { newCurrencyRate } = req.query;
    const parsedNewCurrency = parseInt(newCurrencyRate);
    if (isNaN(parsedNewCurrency)) {
      return res.status(400).send("Currency should be Number");
    }
    const result = await setUSDRate(parsedNewCurrency);
    if (!result)
      return res.status(404).send({ message: "Currency rate not updated" });
    return res
      .status(200)
      .send({ message: "Updated Successfully", data: result });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error while getting updating product", err: err });
  }
});
