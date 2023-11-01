import { Schema, model } from "mongoose";
import * as uuid from "uuid"



const used = [];

function randomId() {
  let rand = randNum();
  if (used.includes(rand)) {
    rand = randNum()
  }
  used.push(rand);
  return rand;
}

function randNum() {
  return Math.ceil(Math.random() * 1000000);
}

const productSchema = new Schema({
  full_name: String,

  full_model: String,

  price_usd: String,

  percent_3m: String,

  percent_6m: String,

  percent_9m: String,

  quantity: String,

  company: String,

  percent_cash: String,

  diameter: String,

  size: String,

  width: String,

  image: String,

  id_product: {
    type: String,
    default: uuid.v4()
  },
  id: {
    type: String,
    default: randomId()
  }
});



export default model("Product", productSchema);
