import mongoose from "mongoose";
import Product from "./src/models/product.model.js";
import Order from "./src/models/order.model.js";
import fs from "fs";

export const getProducts = async (offset, limit) => {
  try {
    offset = offset ? offset : 0;
    let products = await Product.find()
      .skip(offset || 0)
      .limit(limit || 10)
      .select("-__v")
      .lean();
    return products;
  } catch (err) {
    console.log(err);
  }
};

export const getOneById = async (productId) => {
  try {
    let product = await Product.findById(
      new mongoose.Types.ObjectId(productId)
    ).select("-__v");
    return product;
  } catch (err) {
    console.log(err);
  }
};

export const getAllProducts = async () => {
  let products = await Product.find();
  return products;
};

export const addProducts = async (data) => {
  try {
    const newProduct = await Product.insertMany(data);
    return newProduct;
  } catch (err) {
    console.log(err);
  }
};

export const updateProduct = async (productId, newProduct) => {
  try {
    await Product.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      newProduct[0]
    );
  } catch (err) {
    console.log(err);
  }
};

export const getUserOrders = async (userContact, username) => {
  try {
    const userOrders = await Order.find({
      $or: [{ userContact: userContact }, { username: username }],
    })
      .populate("product")
      .select("-__v");
    return userOrders;
  } catch (err) {
    console.log(err);
  }
};

export const orderProduct = async (credentials) => {
  try {
    const { username, userContact, productId, creditType } = credentials;

    const newOrder = await Order.create({
      username,
      userContact,
      creditType,
      product: new mongoose.Types.ObjectId(productId),
    });
    const result = await newOrder.save();
    if (!result) {
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};

export const updateProductById = async (productId, updates) => {
  try {
    const product = await Product.findById(
      new mongoose.Types.ObjectId(productId)
    );
    if (product) {
      fs.access(product.image, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`${product.image} does not exist`);
        } else {
          if (product.image.startsWith("./public")) {
            fs.unlinkSync(product.image);
          } else {
            fs.unlinkSync("./public/images/" + product.image);
          }
        }
      });
    }
    const result = await Product.findByIdAndUpdate(
      new mongoose.Types.ObjectId(productId),
      updates
    );
    return result;
  } catch (err) {
    console.log(err);
  }
};

export const addProduct = async (product) => {
  try {
    const result = await Product.create(product);
    return result;
  } catch (err) {
    console.log(err);
  }
};

export const deleteProduct = async (productId) => {
  try {
    const product = await Product.findById(
      new mongoose.Types.ObjectId(productId)
    );
    if (product) {
      fs.access(product.image, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`${product.image} does not exist`);
        } else {
          if (product.image.startsWith("./public")) {
            fs.unlinkSync(product.image);
          } else {
            fs.unlinkSync("./public/images/" + product.image);
          }
        }
      });
    }
    const result = await Product.findByIdAndDelete(
      new mongoose.Types.ObjectId(productId)
    );
    return result;
  } catch (err) {
    console.log(err);
  }
};
