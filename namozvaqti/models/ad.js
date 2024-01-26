import { Schema, model } from "mongoose";


const adSchema = new Schema({
    name: {
        type: String, required: true
    },
    link: {
        type: String, required: true
    },
    image: {
        type: String, required: true
    },
    location: {
        type: String,
        enum: ["header", "popup"],
        required: true
    },

    clicked: {
        type: Number,
        default: 0,
    },

    seen: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    }
);



export default model("Ad", adSchema);