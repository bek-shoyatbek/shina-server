import { Schema, model } from "mongoose";



const orderSchema = new Schema({
    username: String,

    userContact: String,

    creditType: String,

    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    }
});



export default model("Order", orderSchema);
